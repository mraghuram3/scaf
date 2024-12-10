use std::collections::HashMap;
use tracing::Level;

pub(crate) mod print;

#[allow(dead_code)]
fn format_log_message(message: &str, level: &str) -> String {
    match level {
        "INFO" => format!("┃ 🔹 {}", message),
        "WARN" => format!("┃ ⚠️  {}", message),
        "ERROR" => format!("┃ ❌ {}", message),
        _ => format!("┃   {}", message),
    }
}

pub(crate) fn init_logger() {
    use tracing_subscriber::fmt;
    fmt::fmt()
        .with_max_level(Level::INFO)
        .with_target(false)
        .with_thread_ids(false)
        .with_file(false)
        .with_line_number(false)
        .with_ansi(true)
        .with_level(true)
        .with_writer(std::io::stdout)
        .with_timer(())
        .init();
}


pub(crate) fn replace_args(content: &str, args: &HashMap<String, String>) -> String {
    let mut result = content.to_string();
    for (key, value) in args {
        result = result.replace(&format!("{{{{ {} }}}}", key), value);
    }
    result
}
