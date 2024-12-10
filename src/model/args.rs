use dialoguer::{Input, MultiSelect, Select};
use dialoguer::theme::ColorfulTheme;
use serde::{Deserialize, Serialize};
use tracing::{error, warn};

#[derive(Debug, Serialize, Deserialize)]
pub struct TemplateArg {
    pub name: String,
    pub key: String,
    pub description: Option<String>,
    pub long_description: Option<String>,
    #[serde(rename = "type")]
    pub arg_type: ArgType,
    pub default: String,
    #[serde(default)]
    pub values: Option<Vec<ArgValue>>,
    #[serde(default)]
    pub required: bool,
    #[serde(default)]
    pub pattern: Option<String>,
    #[serde(default)]
    pub group: Option<String>,
    #[serde(default)]
    pub depends_on: Option<Vec<String>>,
    #[serde(default)]
    pub multiple: bool,
    #[serde(default)]
    pub delimiter: Option<String>,
}


#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum ArgType {
    String,
    Number,
    Boolean,
    Enum,
    Path,
    Email,
    Url,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ArgValue {
    pub value: String,
    pub description: String,
    pub details: Option<String>,
}

impl TemplateArg {
    pub(crate) async fn collect_args(&self) -> anyhow::Result<String> {
        let theme = ColorfulTheme::default();
        if let Some(details) = self.get_details() {
            println!("\n{}\n", details);
        }

        let mut value = String::new();
        let mut is_valid = false;

        while !is_valid {
            if let Some(values) = &self.values {
                let items: Vec<String> = values
                    .iter()
                    .map(|v| format!("{}: {}", v.value, v.description))
                    .collect();

                if self.multiple {
                    let defaults: Vec<bool> = values
                        .iter()
                        .map(|v| self.default.split(',').any(|d| d.trim() == v.value))
                        .collect();

                    let selections = MultiSelect::with_theme(&theme)
                        .with_prompt(&self.get_prompt())
                        .items(&items)
                        .defaults(&defaults)
                        .interact()?;

                    if selections.is_empty() && self.required {
                        error!("At least one option must be selected");
                        continue;
                    }

                    value = selections
                        .iter()
                        .map(|&i| values[i].value.clone())
                        .collect::<Vec<String>>()
                        .join(self.delimiter.as_deref().unwrap_or(","));
                } else {
                    let default_idx = values
                        .iter()
                        .position(|v| v.value == self.default)
                        .unwrap_or(0);

                    let selection = Select::with_theme(&theme)
                        .with_prompt(&self.get_prompt())
                        .items(&items)
                        .default(default_idx)
                        .interact()?;

                    value = values[selection].value.clone();
                }
            } else {
                value = Input::with_theme(&theme)
                    .with_prompt(&self.get_prompt())
                    .default(self.default.clone())
                    .interact_text()?;
            }

            match self.validate_value(&value) {
                Ok(validated) => {
                    value = validated;
                    is_valid = true;
                }
                Err(err) => {
                    error!("Invalid input: {}", err);
                    warn!("Please try again");
                }
            }
        }

        Ok(value)
    }
    pub fn validate_value(&self, value: &str) -> Result<String, String> {
        if self.multiple {
            let delimiter = self.delimiter.as_deref().unwrap_or(",");
            let values: Vec<&str> = value.split(delimiter).map(str::trim).collect();

            for val in values {
                self.validate_single_value(val)?;
            }
            Ok(value.to_string())
        } else {
            self.validate_single_value(value)
        }
    }

    fn validate_single_value(&self, value: &str) -> Result<String, String> {
        match self.arg_type {
            ArgType::Number => {
                value.parse::<f64>()
                    .map_err(|_| "Value must be a number".to_string())?;
            },
            ArgType::Boolean => {
                match value.to_lowercase().as_str() {
                    "true" | "false" => {},
                    _ => return Err("Value must be true or false".to_string()),
                }
            },
            ArgType::Enum => {
                if let Some(values) = &self.values {
                    if !values.iter().any(|v| v.value == value) {
                        let valid_values: Vec<String> = values.iter()
                            .map(|v| format!("{} ({})", v.value, v.description))
                            .collect();
                        return Err(format!("Value must be one of:\n{}", valid_values.join("\n")));
                    }
                }
            },
            ArgType::Email => {
                if !value.contains('@') {
                    return Err("Invalid email address".to_string());
                }
            },
            ArgType::Url => {
                if !value.starts_with("http://") && !value.starts_with("https://") {
                    return Err("Invalid URL".to_string());
                }
            },
            ArgType::Path => {
                if value.contains("..") {
                    return Err("Path cannot contain ..".to_string());
                }
            },
            _ => {},
        }

        if let Some(pattern) = &self.pattern {
            let regex = regex::Regex::new(pattern)
                .map_err(|_| "Invalid regex pattern".to_string())?;
            if !regex.is_match(value) {
                return Err(format!("Value does not match pattern: {}", pattern));
            }
        }

        Ok(value.to_string())
    }

    pub fn get_prompt(&self) -> String {
        let mut prompt = self.name.clone();
        if let Some(desc) = &self.description {
            prompt = format!("{} ({})", prompt, desc);
        }
        if self.multiple {
            prompt = format!("{} (Select multiple with space)", prompt);
        }
        prompt
    }

    pub fn get_details(&self) -> Option<String> {
        self.long_description.clone()
    }
}
