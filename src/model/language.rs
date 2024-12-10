use std::str::FromStr;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum Language {
    JavaScript,
    TypeScript,
    Rust,
    Go,
    Python,
    Java,
    CSharp,
    Cpp,
    Other(String),
}

impl FromStr for Language {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "javascript" => Ok(Language::JavaScript),
            "typescript" => Ok(Language::TypeScript),
            "rust" => Ok(Language::Rust),
            "go" => Ok(Language::Go),
            "python" => Ok(Language::Python),
            "java" => Ok(Language::Java),
            "csharp" => Ok(Language::CSharp),
            "cpp" => Ok(Language::Cpp),
            other => Ok(Language::Other(other.to_string())),
        }
    }
}

impl std::fmt::Display for Language {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Language::JavaScript => write!(f, "JavaScript"),
            Language::TypeScript => write!(f, "TypeScript"),
            Language::Rust => write!(f, "Rust"),
            Language::Go => write!(f, "Go"),
            Language::Python => write!(f, "Python"),
            Language::Java => write!(f, "Java"),
            Language::CSharp => write!(f, "C#"),
            Language::Cpp => write!(f, "C++"),
            Language::Other(lang) => write!(f, "{}", lang),
        }
    }
}