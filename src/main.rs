mod model;
mod cli;
mod utils;

use crate::cli::{bootstrap_cli, Cli};
use anyhow::{Result};
use clap::Parser;
use tokio::runtime::Runtime;

fn main() -> Result<()> {
    bootstrap_cli();

    let cli = Cli::parse();
    let rt = Runtime::new()?;
    rt.block_on(cli.run())?;

    Ok(())
}
