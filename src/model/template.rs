use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use indicatif::{ProgressBar, ProgressStyle};
use tracing::{warn, debug};
use crate::utils::print::{print_section_footer, print_section_header};
use super::args::TemplateArg;
use super::language::Language;
use super::step::TemplateStep;

#[derive(Debug, Serialize, Deserialize)]
pub struct TemplateExtend {
    pub template_id: String,
    pub version: String,
    pub args: Vec<ExtendArg>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ExtendArg {
    pub name: String,
    pub value: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Template {
    #[serde(rename = "$schema")]
    pub schema: Option<String>,
    pub name: String,
    pub version: String,
    pub description: String,
    pub author: String,
    pub language: Language,
    pub tags: Vec<String>,
    pub args: Vec<TemplateArg>,
    pub extends: Vec<TemplateExtend>,
    pub steps: Vec<TemplateStep>,
}

impl Template {
    pub async fn collect_arguments(&self) -> anyhow::Result<HashMap<String, String>> {
        let mut args_values = HashMap::new();
        let mut groups = HashMap::new();
        for arg in &self.args {
            // let group = arg.group.clone().unwrap_or_else(|| "General".to_string());
            groups
                .entry("General".to_string())
                .or_insert_with(Vec::new)
                .push(arg);
        }

        for (group_name, args) in groups {
            print_section_header(&group_name);

            for arg in args {
                if let Some(deps) = &arg.depends_on {
                    let mut can_proceed = true;
                    for dep in deps {
                        if let Some(dep_value) = args_values.get(dep) {
                            debug!("Dependency {} = {}", dep, dep_value);
                        } else {
                            debug!("Missing required dependency: {}", dep);
                            can_proceed = false;
                        }
                    }
                    if !can_proceed {
                        continue;
                    }
                }
                let value = arg.collect_args().await?;
                args_values.insert(arg.key.clone(), value.clone());
            }
            print_section_footer();
        }
        Ok(args_values)
    }
    pub async fn execute(&self, args_values: &HashMap<String, String>) -> anyhow::Result<(usize, usize)> {
        let mut executed_steps = 0;
        let mut skipped_steps = 0;
        let total_steps = self.steps.len();
        let pb = ProgressBar::new(total_steps as u64);
        pb.set_style(ProgressStyle::with_template("{spinner:.green} [{elapsed_precise}] [{wide_bar:.cyan/blue}] {pos}/{len} ({percent}%) {msg}")?
            // .with_key("eta", |state: &ProgressState, w: &mut dyn Write| write!(w, "{:.1}s", state.eta().as_secs_f64()).unwrap())
            .progress_chars("#>-"));

        // pb.set_style(ProgressStyle::default_bar()
        //     .template("{spinner:.green} [{elapsed_precise}] [{bar:40.cyan/blue}] {pos}/{len} ({percent}%) {msg}")?
        //     .progress_chars("#>-"));

        for step in &self.steps {
            pb.set_message(format!("Processing: {}", step.description));
            if step.check_condition(&args_values) {
                step.execute(&args_values).await?;
            } else {
                skipped_steps += 1;
                warn!("Skipping: {} (conditions not met)", step.description);
            }
            executed_steps += 1;
            pb.set_position(executed_steps as u64);
        }
        pb.finish_with_message("Processing complete!");
        Ok((executed_steps, skipped_steps))
    }
}
