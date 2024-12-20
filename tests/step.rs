use scaf::model::step::{TemplateStep, StepType, ModificationType, Conditions, LogicalOperator, Condition, ConditionOperator};
use std::collections::HashMap;
use tempfile::tempdir;

#[tokio::test]
async fn test_directory_step() {
    let temp_dir = tempdir().unwrap();
    let test_dir = temp_dir.path().join("test_dir");

    let step = TemplateStep {
        id: "test-dir".to_string(),
        description: "Test Directory Creation".to_string(),
        path: test_dir.to_str().unwrap().to_string(),
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
    };

    let args = HashMap::new();
    assert!(step.execute(&args).await.is_ok());
    assert!(test_dir.exists());
}

#[tokio::test]
async fn test_file_step() {
    let temp_dir = tempdir().unwrap();
    let test_file = temp_dir.path().join("test.txt");

    let step = TemplateStep {
        id: "test-file".to_string(),
        description: "Test File Creation".to_string(),
        path: test_file.to_str().unwrap().to_string(),
        step_type: StepType::File,
        content: Some("test content".to_string()),
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
    };

    let args = HashMap::new();
    assert!(step.execute(&args).await.is_ok());
    assert!(test_file.exists());
    assert_eq!(tokio::fs::read_to_string(&test_file).await.unwrap(), "test content");
}

#[tokio::test]
async fn test_modify_step() {
    let temp_dir = tempdir().unwrap();
    let test_file = temp_dir.path().join("modify.txt");
    tokio::fs::write(&test_file, "original content\n").await.unwrap();

    let step = TemplateStep {
        id: "test-modify".to_string(),
        description: "Test File Modification".to_string(),
        path: test_file.to_str().unwrap().to_string(),
        step_type: StepType::Modify,
        content: Some("new content".to_string()),
        conditions: None,
        line_number: None,
        modification_type: Some(ModificationType::Append),
        source: None,
        url: None,
        branch: None,
        package_manager: None,
        dependencies: None,
        dev_dependencies: None,
        template_engine: None,
        variables: None,
    };

    let args = HashMap::new();
    assert!(step.execute(&args).await.is_ok());
    let content = tokio::fs::read_to_string(&test_file).await.unwrap();
    assert!(content.contains("original content"));
    assert!(content.contains("new content"));
}

#[tokio::test]
async fn test_conditional_step() {
    let temp_dir = tempdir().unwrap();
    let test_file = temp_dir.path().join("conditional.txt");

    let step = TemplateStep {
        id: "test-conditional".to_string(),
        description: "Test Conditional Step".to_string(),
        path: test_file.to_str().unwrap().to_string(),
        step_type: StepType::File,
        content: Some("conditional content".to_string()),
        conditions: Some(Conditions {
            operator: LogicalOperator::And,
            conditions: vec![
                Condition {
                    field: "test_flag".to_string(),
                    operator: ConditionOperator::Equals,
                    value: "true".to_string(),
                }
            ],
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
    };

    // Test with condition not met
    let mut args = HashMap::new();
    args.insert("test_flag".to_string(), "false".to_string());
    assert!(!test_file.exists());

    args.insert("test_flag".to_string(), "true".to_string());
    assert!(step.execute(&args).await.is_ok());
    assert!(test_file.exists());
    assert_eq!(tokio::fs::read_to_string(&test_file).await.unwrap(), "conditional content");
}
