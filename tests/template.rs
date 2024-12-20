
use std::collections::HashMap;
use scaf::args::{ArgType, TemplateArg};
use scaf::language::Language;
use scaf::step::{Condition, ConditionOperator, Conditions, LogicalOperator, StepType, TemplateStep};
use scaf::Template;

fn create_test_template() -> Template {
    Template {
        schema: Some("test-schema".to_string()),
        name: "Test Template".to_string(),
        version: "1.0.0".to_string(),
        description: "Test Description".to_string(),
        author: "Test Author".to_string(),
        language: Language::Rust,
        tags: vec!["test".to_string(), "template".to_string()],
        args: vec![],
        extends: vec![],
        steps: vec![],
    }
}

#[tokio::test]
async fn test_template_basic_info() {
    let template = create_test_template();
    assert_eq!(template.name, "Test Template");
    assert_eq!(template.version, "1.0.0");
    assert_eq!(template.description, "Test Description");
    assert_eq!(template.author, "Test Author");
    assert_eq!(template.tags, vec!["test", "template"]);
}
//
// #[tokio::test]
// async fn test_template_with_args() {
//     let mut template = create_test_template();
//     template.args = vec![TemplateArg {
//         name: "Project Name".to_string(),
//         key: "project_name".to_string(),
//         description: Some("Test project name".to_string()),
//         long_description: None,
//         arg_type: ArgType::String,
//         default: "test-project".to_string(),
//         values: None,
//         required: true,
//         pattern: None,
//         group: None,
//         depends_on: None,
//         multiple: false,
//
//         delimiter: None,
//     }];
//
//     let args_result = template.collect_arguments().await;
//     assert!(args_result.is_err());
// }

#[tokio::test]
async fn test_template_with_steps() {
    let mut template = create_test_template();
    template.steps = vec![TemplateStep {
        id: "test-step".to_string(),
        description: "Test Step".to_string(),
        path: "./test".to_string(),
        step_type: StepType::Directory,
        content: None,
        conditions: None,
        line_number: None,
        modification_type: None,
        source: None,
        url: None,
        branch: None,
        package_manager: None,
        dependencies: None,
        dev_dependencies: None,
        template_engine: None,
        variables: None,
    }];

    let args = HashMap::new();
    let result = template.execute(&args).await;
    assert!(result.is_ok());
    let (executed, skipped) = result.unwrap();
    assert_eq!(executed, 1);
    assert_eq!(skipped, 0);
}

#[tokio::test]
async fn test_template_with_conditions() {
    let mut template = create_test_template();
    let mut conditions = HashMap::new();
    conditions.insert("test_condition".to_string(), "true".to_string());

    template.steps = vec![TemplateStep {
        id: "conditional-step".to_string(),
        description: "Conditional Step".to_string(),
        path: "./test".to_string(),
        step_type: StepType::Directory,
        content: None,
        conditions: Some(Conditions {
            operator: LogicalOperator::And,
            conditions: vec![Condition {
                field: "test_condition".to_string(),
                operator: ConditionOperator::Equals,
                value: "true".to_string(),
            }],
        }),
        line_number: None,
        modification_type: None,
        source: None,
        url: None,
        branch: None,
        package_manager: None,
        dependencies: None,
        dev_dependencies: None,
        template_engine: None,
        variables: None,
    }];

    let result = template.execute(&conditions).await;
    assert!(result.is_ok());
    let (executed, skipped) = result.unwrap();
    assert_eq!(executed, 1);
    assert_eq!(skipped, 0);
}
