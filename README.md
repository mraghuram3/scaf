# SCAF - Project Scaffolding CLI

SCAF is a powerful CLI tool for scaffolding projects from templates. It supports dynamic templates with conditional features, argument validation, and grouped configurations.

![Scaf Demo](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZmR4azNhdTVyMXd0MGhvc2oyNDBzaXZtZnI3cjRneWVsZHZ1NWE5aSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/TXJiSN8vCERuE/giphy.gif)

## Features

- 🎯 Template-based project scaffolding
- 🔍 Smart argument collection with validation
- 🎨 Beautiful CLI interface with grouped options
- 🔄 Support for conditional features
- 📦 Multiple template formats
- 🛠️ Extensible template system

## Installation

```bash
curl -sSL https://github.com/itsparser/scaf/raw/main/install.sh | bash
```

## Usage

```bash
# Create a new project from a template URL
scaf new https://template.com/template.json

# Create a new project from a local template file
scaf new -f template.json
```

## Template Format

Templates are defined in JSON format with the following structure:

```json
{
    "$schema": "http://json-schema.org/draft-04/schema#",
    "version": "1.0.0",
    "name": "Template Name",
    "description": "Template description",
    "author": "Author Name",
    "language": "typescript",
    "tags": ["tag1", "tag2"],
    "args": [
        {
            "name": "Display Name",
            "key": "variable_name",
            "description": "Short description",
            "long_description": "Detailed explanation of the argument",
            "type": "string|number|enum",
            "default": "default value",
            "pattern": "^regex-pattern$",
            "required": true,
            "group": "Group Name",
            "values": [
                {
                    "value": "option1",
                    "description": "Option description",
                    "details": "Detailed explanation"
                }
            ]
        }
    ],
    "steps": [
        {
            "id": "step-id",
            "description": "Step description",
            "type": "file|directory|command",
            "path": "path/to/target",
            "content": "file content or command",
            "conditions": {
                "operator": "and|or",
                "conditions": [
                    {
                        "field": "arg_key",
                        "operator": "equals|notEquals|contains|startsWith|endsWith|in|notIn",
                        "value": "expected value"
                    }
                ]
            }
        }
    ]
}
```

### Argument Types

- `string`: Text input with optional regex validation
- `number`: Numeric input
- `enum`: Selection from predefined options
- `boolean`: True/false selection
- `path`: File or directory path
- `email`: Email address with validation
- `url`: URL with validation

### Argument Groups

Arguments can be organized into logical groups:
- Basic Configuration
- Architecture
- Styling
- Testing
- Features
- DevOps
- Custom groups

### Conditional Steps

Steps can be conditionally executed based on argument values:

```json
{
    "conditions": {
        "operator": "or",
        "conditions": [
            {
                "field": "database",
                "operator": "equals",
                "value": "mongodb"
            },
            {
                "field": "features",
                "operator": "in",
                "value": "feature1,feature2"
            }
        ]
    }
}
```

### Operators

- `equals`: Exact match
- `notEquals`: Not equal
- `contains`: String contains
- `startsWith`: String starts with
- `endsWith`: String ends with
- `in`: Value in comma-separated list
- `notIn`: Value not in comma-separated list

## Sample Templates

### React Application Template
```bash
scaf new -f samples/react-app-template.json
```
Features:
- TypeScript support
- Multiple state management options
- Various styling solutions
- Testing frameworks
- CI/CD configuration
- Package manager selection
- Additional features (PWA, i18n, analytics)

### Express API Template
```bash
scaf new -f samples/node-express-template.json
```
Features:
- TypeScript support
- Multiple database options
- Authentication
- API documentation
- Docker support
- Environment configuration

## Template Development

1. Create a new JSON file following the template format
2. Define required arguments with validation
3. Group related arguments for better organization
4. Add conditional steps based on user choices
5. Test the template:
   ```bash
   scaf new -f your-template.json
   ```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License

## Author

Email: [Vasanth Kumar](mailto:itsparser@gmail.com), [parthasarathy gopu](mailto:parthasarathygopu@gmail.com)
