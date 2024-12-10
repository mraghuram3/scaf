use std::collections::HashMap;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use tracing::{error, debug};
use crate::utils::replace_args;
use tokio::process::Command;

#[derive(Debug, Serialize, Deserialize)]
pub struct TemplateStep {
    pub id: String,
    pub description: String,
    pub path: String,
    #[serde(rename = "type")]
    pub step_type: StepType,
    #[serde(default)]
    pub content: Option<String>,
    #[serde(default)]
    pub conditions: Option<Conditions>,
    #[serde(default)]
    pub line_number: Option<usize>,
    #[serde(default)]
    pub modification_type: Option<ModificationType>,
    #[serde(default)]
    pub source: Option<String>,
    #[serde(default)]
    pub url: Option<String>,
    #[serde(default)]
    pub branch: Option<String>,
    #[serde(default)]
    pub package_manager: Option<String>,
    #[serde(default)]
    pub dependencies: Option<Vec<String>>,
    #[serde(default)]
    pub dev_dependencies: Option<Vec<String>>,
    #[serde(default)]
    pub template_engine: Option<String>,
    #[serde(default)]
    pub variables: Option<HashMap<String, String>>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum LogicalOperator {
    And,
    Or,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Conditions {
    #[serde(default = "default_operator")]
    pub operator: LogicalOperator,
    pub conditions: Vec<Condition>,
}

fn default_operator() -> LogicalOperator {
    LogicalOperator::And
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Condition {
    pub field: String,
    pub operator: ConditionOperator,
    pub value: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ConditionOperator {
    Equals,
    NotEquals,
    Contains,
    StartsWith,
    EndsWith,
    In,
    NotIn,
}

impl Conditions {
    pub fn evaluate(&self, args: &HashMap<String, String>) -> bool {
        match self.operator {
            LogicalOperator::And => self.conditions.iter().all(|c| c.evaluate(args)),
            LogicalOperator::Or => self.conditions.iter().any(|c| c.evaluate(args)),
        }
    }
}

impl Condition {
    pub fn evaluate(&self, args: &HashMap<String, String>) -> bool {
        let field_value = match args.get(&self.field) {
            Some(value) => value,
            None => return false,
        };

        match self.operator {
            ConditionOperator::Equals => field_value == &self.value,
            ConditionOperator::NotEquals => field_value != &self.value,
            ConditionOperator::Contains => field_value.contains(&self.value),
            ConditionOperator::StartsWith => field_value.starts_with(&self.value),
            ConditionOperator::EndsWith => field_value.ends_with(&self.value),
            ConditionOperator::In => {
                let field_values: Vec<&str> = field_value.split(',').map(str::trim).collect();
                field_values.contains(&self.value.as_str())
            },
            ConditionOperator::NotIn => {
                let field_values: Vec<&str> = field_value.split(',').map(str::trim).collect();
                !field_values.contains(&self.value.as_str())
            },
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum StepType {
    Directory,
    File,
    Download,
    Command,
    Git,
    Modify,
    // Template,
    // Copy,
    // Dependencies,
}


#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ModificationType {
    Append,
    Prepend,
    Replace,
    InsertAfter,
    InsertBefore,
}



impl TemplateStep {
    pub fn check_condition(&self, args: &HashMap<String, String>) -> bool {
        if let Some(conditions) = &self.conditions {
            conditions.evaluate(args)
        } else {
            true
        }
    }

    pub async fn execute(&self, args_values: &HashMap<String, String>) -> anyhow::Result<()> {
        let path = replace_args(&self.path, args_values);
        let path = PathBuf::from(path);

        match self.step_type {
            StepType::Directory => self.create_dir(&path).await?,
            StepType::File => self.add_file(&path, args_values).await?,
            StepType::Download => self.download_file(&path, args_values).await?,
            StepType::Command => self.execute_command(args_values).await?,
            StepType::Git => self.git_command(&path).await?,
            StepType::Modify => self.modify_file(&path, args_values).await?,
            // StepType::Template => {}
            // StepType::Copy => {}
            // StepType::Dependencies => {}
        }
        Ok(())
    }

    pub(crate) async fn modify_file(&self, path: &PathBuf,
                                    args_values: &HashMap<String, String>)
        -> anyhow::Result<()> {
        let content = replace_args(&self.content.as_ref().unwrap_or(&String::new()), args_values);
        let file_content = if tokio::fs::try_exists(path).await? {
            tokio::fs::read_to_string(path).await?
        } else {
            String::new()
        };

        let lines: Vec<&str> = file_content.lines().collect();
        let mut new_content = Vec::new();

        if let Some(modification_type) = &self.modification_type {

            match modification_type {
                ModificationType::Append => {
                    new_content.extend(lines.iter().map(|&s| s.to_string()));
                    if !file_content.is_empty() {
                        new_content.push(String::new()); // Add newline before appending
                    }
                    new_content.push(content.to_string());
                },
                ModificationType::Prepend => {
                    new_content.push(content.to_string());
                    if !file_content.is_empty() {
                        new_content.push(String::new()); // Add newline after prepending
                    }
                    new_content.extend(lines.iter().map(|&s| s.to_string()));
                },
                ModificationType::Replace => {
                    if let Some(line_num) = self.line_number {
                        for (i, line) in lines.iter().enumerate() {
                            if i + 1 == line_num {
                                new_content.push(content.to_string());
                            } else {
                                new_content.push(line.to_string());
                            }
                        }
                    } else {
                        // If no line number specified, replace entire file
                        new_content.push(content.to_string());
                    }
                },
                ModificationType::InsertAfter => {
                    if let Some(line_num) = self.line_number {
                        for (i, line) in lines.iter().enumerate() {
                            new_content.push(line.to_string());
                            if i + 1 == line_num {
                                new_content.push(content.to_string());
                            }
                        }
                    } else {
                        new_content.extend(lines.iter().map(|&s| s.to_string()));
                        new_content.push(content.to_string());
                    }
                },
                ModificationType::InsertBefore => {
                    if let Some(line_num) = self.line_number {
                        for (i, line) in lines.iter().enumerate() {
                            if i + 1 == line_num {
                                new_content.push(content.to_string());
                            }
                            new_content.push(line.to_string());
                        }
                    } else {
                        new_content.push(content.to_string());
                        new_content.extend(lines.iter().map(|&s| s.to_string()));
                    }
                },
            }


        }

        tokio::fs::write(path, new_content.join("\n")).await?;
        Ok(())
    }

    /// Create a directory
    pub(crate) async fn create_dir(&self, path: &PathBuf) -> anyhow::Result<()> {
        debug!("Creating directory: {}", path.display());
        tokio::fs::create_dir_all(path).await
            .map_err(|_| anyhow::Error::msg("Failed to create directory"))
    }
    pub(crate) async fn add_file(&self, path: &PathBuf,
                                    args_values: &HashMap<String, String>)
        -> anyhow::Result<()> {
        if let Some(content) = &self.content {
            let content = replace_args(content, args_values);
            if let Some(parent) = path.parent() {
                tokio::fs::create_dir_all(parent).await?;
            }
            debug!("Creating file: {}", path.display());
            tokio::fs::write(path, content).await?;
        }
        Ok(())
    }
    pub(crate) async fn download_file(&self, path: &PathBuf,
                                      args_values: &HashMap<String, String>)
        -> anyhow::Result<()> {
        if let Some(url) = &self.url {
            let url = replace_args(url, args_values);
            debug!("Downloading from {} to {}", url, path.display());
            if let Some(parent) = path.parent() {
                tokio::fs::create_dir_all(parent).await?;
            }
            let response = reqwest::get(&url).await?;
            let content = response.bytes().await?;
            tokio::fs::write(path, content).await?;
        }
        Ok(())
    }
    pub(crate) async fn execute_command(&self, args_values: &HashMap<String, String>)
        -> anyhow::Result<()> {
        if let Some(content) = &self.content {
            let command = replace_args(content, args_values);
            debug!("Running command: {}", command);
            let output = Command::new("sh")
                .arg("-c")
                .arg(&command)
                .output()
                .await?;
            if !output.status.success() {
                error!("Command failed: {}", String::from_utf8_lossy(&output.stderr));
            }
        }
        Ok(())
    }
    pub(crate) async fn git_command(&self, path: &PathBuf)
        -> anyhow::Result<()> {
        let output = Command::new("git")
            .current_dir(&path)
            .arg("init")
            .args(if let Some(branch) = &self.branch {
                vec!["-b", branch]
            } else {
                vec![]
            })
            .output()
            .await?;
        if !output.status.success() {
            error!("Git init failed: {}", String::from_utf8_lossy(&output.stderr));
        }
        Ok(())
    }
}



// async fn process_step(
//     step: &TemplateStep,
//     args_values: &HashMap<String, String>,
// ) -> anyhow::Result<()> {
//     let path = replace_args(&step.path, args_values);
//     let path = PathBuf::from(path);
//
//     match &step.step_type {
//         StepType::Directory => {
//             info!("Creating directory: {}", path.display());
//             tokio::fs::create_dir_all(&path).await?;
//         }
//         StepType::File => {
//             if let Some(content) = &step.content {
//                 let content = replace_args(content, args_values);
//                 if let Some(parent) = path.parent() {
//                     tokio::fs::create_dir_all(parent).await?;
//                 }
//                 info!("Creating file: {}", path.display());
//                 tokio::fs::write(path, content).await?;
//             }
//         }
//         StepType::Command => {
//             if let Some(content) = &step.content {
//                 let command = replace_args(content, args_values);
//                 info!("Running command: {}", command);
//                 let output = Command::new("sh")
//                     .arg("-c")
//                     .arg(&command)
//                     .output()
//                     .await?;
//                 if !output.status.success() {
//                     error!("Command failed: {}", String::from_utf8_lossy(&output.stderr));
//                 }
//             }
//         }
//         StepType::Modify => {
//             if let Some(content) = &step.content {
//                 let content = replace_args(content, args_values);
//                 if let Some(modification_type) = &step.modification_type {
//                     info!("Modifying file: {}", path.display());
//                     modify_file(&path, &content, step.line_number, modification_type).await?;
//                 } else {
//                     warn!("Missing modification type for file modification step");
//                 }
//             }
//         }
//         StepType::Template => {
//             if let Some(content) = &step.content {
//                 let content = replace_args(&serde_json::to_string_pretty(content)?, args_values);
//                 if let Some(parent) = path.parent() {
//                     tokio::fs::create_dir_all(parent).await?;
//                 }
//                 info!("Creating template file: {}", path.display());
//                 tokio::fs::write(path, content).await?;
//             }
//         }
//         StepType::Copy => {
//             if let Some(source) = &step.source {
//                 let source_path = replace_args(source, args_values);
//                 info!("Copying from {} to {}", source_path, path.display());
//                 if let Some(parent) = path.parent() {
//                     tokio::fs::create_dir_all(parent).await?;
//                 }
//                 let content = tokio::fs::read_to_string(&source_path).await?;
//                 tokio::fs::write(&path, content).await?;
//             }
//         }
//         StepType::Download => {
//             if let Some(url) = &step.url {
//                 let url = replace_args(url, args_values);
//                 info!("Downloading from {} to {}", url, path.display());
//                 if let Some(parent) = path.parent() {
//                     tokio::fs::create_dir_all(parent).await?;
//                 }
//                 let response = reqwest::get(&url).await?;
//                 let content = response.bytes().await?;
//                 tokio::fs::write(path, content).await?;
//             }
//         }
//         StepType::Git => {
//             info!("Initializing Git repository in {}", path.display());
//             let output = Command::new("git")
//                 .current_dir(&path)
//                 .arg("init")
//                 .args(if let Some(branch) = &step.branch {
//                     vec!["-b", branch]
//                 } else {
//                     vec![]
//                 })
//                 .output()
//                 .await?;
//             if !output.status.success() {
//                 error!("Git init failed: {}", String::from_utf8_lossy(&output.stderr));
//             }
//         }
//         StepType::Dependencies => {
//             let package_manager = step.package_manager.as_deref()
//                 .or_else(|| args_values.get("package_manager").map(String::as_str))
//                 .unwrap_or("npm");
//
//             if let Some(deps) = &step.dependencies {
//                 let deps_str = deps.join(" ");
//                 info!("Installing dependencies: {}", deps_str);
//                 let install_cmd = match package_manager {
//                     "yarn" => format!("yarn add {}", deps_str),
//                     "pnpm" => format!("pnpm add {}", deps_str),
//                     _ => format!("npm install {}", deps_str),
//                 };
//                 let output = Command::new("sh")
//                     .current_dir(&path)
//                     .arg("-c")
//                     .arg(&install_cmd)
//                     .output()
//                     .await?;
//                 if !output.status.success() {
//                     error!("Failed to install dependencies: {}", String::from_utf8_lossy(&output.stderr));
//                 }
//             }
//
//             if let Some(dev_deps) = &step.dev_dependencies {
//                 let dev_deps_str = dev_deps.join(" ");
//                 info!("Installing dev dependencies: {}", dev_deps_str);
//                 let install_cmd = match package_manager {
//                     "yarn" => format!("yarn add -D {}", dev_deps_str),
//                     "pnpm" => format!("pnpm add -D {}", dev_deps_str),
//                     _ => format!("npm install -D {}", dev_deps_str),
//                 };
//                 let output = Command::new("sh")
//                     .current_dir(&path)
//                     .arg("-c")
//                     .arg(&install_cmd)
//                     .output()
//                     .await?;
//                 if !output.status.success() {
//                     error!("Failed to install dev dependencies: {}", String::from_utf8_lossy(&output.stderr));
//                 }
//             }
//         },
//     }
//     Ok(())
// }

//
// #[allow(dead_code)]
// async fn modify_file(
//     path: &PathBuf,
//     content: &str,
//     line_number: Option<usize>,
//     modification_type: &ModificationType,
// ) -> anyhow::Result<()> {
//     let file_content = if tokio::fs::try_exists(path).await? {
//         tokio::fs::read_to_string(path).await?
//     } else {
//         String::new()
//     };
//
//     let lines: Vec<&str> = file_content.lines().collect();
//     let mut new_content = Vec::new();
//
//     match modification_type {
//         ModificationType::Append => {
//             new_content.extend(lines.iter().map(|&s| s.to_string()));
//             if !file_content.is_empty() {
//                 new_content.push(String::new()); // Add newline before appending
//             }
//             new_content.push(content.to_string());
//         },
//         ModificationType::Prepend => {
//             new_content.push(content.to_string());
//             if !file_content.is_empty() {
//                 new_content.push(String::new()); // Add newline after prepending
//             }
//             new_content.extend(lines.iter().map(|&s| s.to_string()));
//         },
//         ModificationType::Replace => {
//             if let Some(line_num) = line_number {
//                 for (i, line) in lines.iter().enumerate() {
//                     if i + 1 == line_num {
//                         new_content.push(content.to_string());
//                     } else {
//                         new_content.push(line.to_string());
//                     }
//                 }
//             } else {
//                 // If no line number specified, replace entire file
//                 new_content.push(content.to_string());
//             }
//         },
//         ModificationType::InsertAfter => {
//             if let Some(line_num) = line_number {
//                 for (i, line) in lines.iter().enumerate() {
//                     new_content.push(line.to_string());
//                     if i + 1 == line_num {
//                         new_content.push(content.to_string());
//                     }
//                 }
//             } else {
//                 new_content.extend(lines.iter().map(|&s| s.to_string()));
//                 new_content.push(content.to_string());
//             }
//         },
//         ModificationType::InsertBefore => {
//             if let Some(line_num) = line_number {
//                 for (i, line) in lines.iter().enumerate() {
//                     if i + 1 == line_num {
//                         new_content.push(content.to_string());
//                     }
//                     new_content.push(line.to_string());
//                 }
//             } else {
//                 new_content.push(content.to_string());
//                 new_content.extend(lines.iter().map(|&s| s.to_string()));
//             }
//         },
//     }
//
//     tokio::fs::write(path, new_content.join("\n")).await?;
//     Ok(())
// }