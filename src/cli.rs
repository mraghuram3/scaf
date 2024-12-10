use std::string::ToString;
use anyhow::Context;
use clap::{Parser, Subcommand};
use reqwest::Url;
use tracing::{info};
use crate::model::Template;
use crate::utils::init_logger;
use crate::utils::print::{display_template_info};

const BANNER: &str = r#"
╭──────────────────────────────────────────╮
│                                          │
│            📦  SCAF                      │
│        Project Scaffolding Tool          │
│                                          │
│            Version: 0.1.0                │
╰──────────────────────────────────────────╯
"#;

const BASE_URL: &str = "https://scaf.pages.dev"; // std::env::var("BASE_URL").unwrap_or("https://scaf.pages.dev".to_string()).as_str();

pub(crate) fn bootstrap_cli() {
    init_logger();
    println!("{}", BANNER);
}


#[derive(Parser)]
#[command(name = "scaf")]
#[command(about = "A CLI to scaffold projects from templates", long_about = None)]
pub(crate) struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    New {
        template: String,
        #[arg(short, long)]
        file: bool,
    },
}

impl Cli {
    pub(crate) async fn run(self) -> Result<(), anyhow::Error>  {
        match self.command {
            Commands::New { template, file } => {
                info!("Loading template from {}", if file { "file" } else { "URL" });
                let template_content = if file {
                    std::fs::read_to_string(&template)
                        .context("Failed to read template file")?
                } else {
                    let url: Url;
                    if template.starts_with("http") {
                        url = Url::parse(&template)?;
                    } else if !template.contains("/") {
                        url = Url::parse(&format!("{}/api/scaf/{}", BASE_URL, template))?;
                    } else if template.split("/").count() == 2 {
                        url = Url::parse(&format!("{}/api/{}", BASE_URL, template))?;
                    } else {
                        anyhow::bail!("Invalid template URL")
                    }
                    reqwest::get(&url.to_string())
                        .await?
                        .text()
                        .await?
                };

                let temp: Template = serde_json::from_str(&template_content)?;
                display_template_info(&temp);

                let args_values = temp.collect_arguments().await?;
                let (executed_steps, skipped_steps) = temp.execute(&args_values).await?;

                println!("\n──────────────────────────────── Result ────────────────────────────");
                println!(" ✨ Project scaffolded successfully!  ");
                println!(" 📊 Executed: {}/{} steps             ", executed_steps, temp.steps.len());
                println!(" ⏭️  Skipped: {} steps                ", skipped_steps);
                println!("────────────────────────────────────────────────────────────────────\n");
            }
        }
        Ok(())
    }

}