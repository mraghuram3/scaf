use tracing::info;
use crate::model::Template;

pub(crate) fn print_section_header(title: &str) {
    println!(
        "\n──────────────────────────── {} ─────────────────────────────",
        title
    );
}

pub(crate) fn print_section_footer() {
    println!("───────────────────────────────────────────────────────────────────────────\n");
}

pub(crate) fn display_template_info(template: &Template) {
    print_section_header("Template Info");
    info!("Name        : {}", template.name);
    info!("Version     : {}", template.version);
    info!("Description : {}", template.description);
    info!("Author      : {}", template.author);
    info!("Language    : {}", template.language);

    if !template.tags.is_empty() {
        info!("Tags        : {}", template.tags.join(", "));
    }

    info!("Steps       : {} steps to execute", template.steps.len());
    print_section_footer();
}