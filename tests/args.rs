use scaf::args::ArgValue;
use scaf::model::{
    args::{TemplateArg, ArgType},
};

#[tokio::test]
async fn test_string_argument() {
    let arg = TemplateArg {
        name: "Test Arg".to_string(),
        key: "test_key".to_string(),
        description: Some("Test Description".to_string()),
        long_description: None,
        arg_type: ArgType::String,
        default: "default".to_string(),
        values: None,
        required: true,
        pattern: Some("^[a-z]+$".to_string()),
        group: None,
        depends_on: None,
        multiple: false,
        delimiter: None,
    };

    assert!(arg.validate_value("test").is_ok());
    assert!(arg.validate_value("TEST").is_err());
    assert!(arg.validate_value("test123").is_err());
}

#[tokio::test]
async fn test_number_argument() {
    let arg = TemplateArg {
        name: "Number Arg".to_string(),
        key: "number_key".to_string(),
        description: Some("Test Number".to_string()),
        long_description: None,
        arg_type: ArgType::Number,
        default: "42".to_string(),
        values: None,
        required: true,
        pattern: None,
        group: None,
        depends_on: None,
        multiple: false,
        delimiter: None,
    };

    assert!(arg.validate_value("42").is_ok());
    assert!(arg.validate_value("3.14").is_ok());
    assert!(arg.validate_value("not_a_number").is_err());
}

#[tokio::test]
async fn test_enum_argument() {
    let arg = TemplateArg {
        name: "Enum Arg".to_string(),
        key: "enum_key".to_string(),
        description: Some("Test Enum".to_string()),
        long_description: None,
        arg_type: ArgType::Enum,
        default: "option1".to_string(),
        values: Some(vec![
            ArgValue {
                value: "option1".to_string(),
                description: "Option 1".to_string(),
                details: None,
            },
            ArgValue {
                value: "option2".to_string(),
                description: "Option 2".to_string(),
                details: None,
            },
        ]),
        required: true,
        pattern: None,
        group: None,
        depends_on: None,
        multiple: false,
        delimiter: None,
    };

    assert!(arg.validate_value("option1").is_ok());
    assert!(arg.validate_value("option2").is_ok());
    assert!(arg.validate_value("option3").is_err());
}

#[tokio::test]
async fn test_multiple_argument() {
    let arg = TemplateArg {
        name: "Multiple Arg".to_string(),
        key: "multiple_key".to_string(),
        description: Some("Test Multiple".to_string()),
        long_description: None,
        arg_type: ArgType::Enum,
        default: "option1,option2".to_string(),
        values: Some(vec![
            ArgValue {
                value: "option1".to_string(),
                description: "Option 1".to_string(),
                details: None,
            },
            ArgValue {
                value: "option2".to_string(),
                description: "Option 2".to_string(),
                details: None,
            },
        ]),
        required: true,
        pattern: None,
        group: None,
        depends_on: None,
        multiple: true,
        delimiter: Some(",".to_string()),
    };

    assert!(arg.validate_value("option1,option2").is_ok());
    assert!(arg.validate_value("option1").is_ok());
    assert!(arg.validate_value("option1,invalid").is_err());
}

#[tokio::test]
async fn test_email_argument() {
    let arg = TemplateArg {
        name: "Email Arg".to_string(),
        key: "email_key".to_string(),
        description: Some("Test Email".to_string()),
        long_description: None,
        arg_type: ArgType::Email,
        default: "test@example.com".to_string(),
        values: None,
        required: true,
        pattern: None,
        group: None,
        depends_on: None,
        multiple: false,
        delimiter: None,
    };

    assert!(arg.validate_value("test@example.com").is_ok());
    assert!(arg.validate_value("invalid-email").is_err());
}

#[tokio::test]
async fn test_url_argument() {
    let arg = TemplateArg {
        name: "URL Arg".to_string(),
        key: "url_key".to_string(),
        description: Some("Test URL".to_string()),
        long_description: None,
        arg_type: ArgType::Url,
        default: "https://example.com".to_string(),
        values: None,
        required: true,
        pattern: None,
        group: None,
        depends_on: None,
        multiple: false,
        delimiter: None,
    };

    assert!(arg.validate_value("https://example.com").is_ok());
    assert!(arg.validate_value("http://example.com").is_ok());
    assert!(arg.validate_value("invalid-url").is_err());
}

#[tokio::test]
async fn test_path_argument() {
    let arg = TemplateArg {
        name: "Path Arg".to_string(),
        key: "path_key".to_string(),
        description: Some("Test Path".to_string()),
        long_description: None,
        arg_type: ArgType::Path,
        default: "./test".to_string(),
        values: None,
        required: true,
        pattern: None,
        group: None,
        depends_on: None,
        multiple: false,
        delimiter: None,
    };

    assert!(arg.validate_value("./test").is_ok());
    assert!(arg.validate_value("/test").is_ok());
    assert!(arg.validate_value("../test").is_err());
} 