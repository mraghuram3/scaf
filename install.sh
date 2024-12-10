#!/bin/bash

# Variables
REPO="itsparser/scaf"  # Your GitHub repository
VERSION="latest"  # Use 'latest' for the latest version or specify a version tag like 'v1.0.0'
INSTALL_DIR="/usr/local/bin"  # Default installation directory
TMP_DIR=$(mktemp -d)  # Create a temporary directory for download

# Determine the OS and architecture
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

# Map architecture names
case "$ARCH" in
    x86_64)
        ARCH="x86_64"
        ;;
    aarch64|arm64)
        ARCH="aarch64"
        ;;
    *)
        echo -e "\033[0;31mUnsupported architecture: $ARCH\033[0m"
        exit 1
        ;;
esac

# Map OS to GitHub artifact names
case "$OS" in
    linux)
        TARGET="unknown-linux-gnu"
        ;;
    darwin)
        TARGET="apple-darwin"
        ;;
    mingw*|msys*|cygwin*)
        TARGET="pc-windows-msvc"
        ;;
    *)
        echo -e "\033[0;31mUnsupported OS: $OS\033[0m"
        exit 1
        ;;
esac

# Determine file extension based on OS
if [ "$OS" == "windows" ]; then
    FILE_EXT="zip"
else
    FILE_EXT="tar.gz"
fi

# Get the latest release version if needed
if [ "$VERSION" == "latest" ]; then
    VERSION=$(curl --silent "https://api.github.com/repos/$REPO/releases/latest" | grep '"tag_name"' | sed -E 's/.*"tag_name": "([^"]+)".*/\1/')
    if [ -z "$VERSION" ]; then
        echo -e "\033[0;31mFailed to fetch the latest version. Please specify a version manually.\033[0m"
        exit 1
    fi
fi

VERSION="v0.1.2-rc003"

# Construct the download URL for the artifact
ARTIFACT_URL="https://github.com/$REPO/releases/download/$VERSION/scaf-${ARCH}-${TARGET}.${FILE_EXT}"

echo "Downloading $ARTIFACT_URL ..."
curl -L "$ARTIFACT_URL" -o "$TMP_DIR/scaf.$FILE_EXT"
if [ $? -ne 0 ]; then
    echo -e "\033[0;31mFailed to download the file. Please check the URL or your internet connection.\033[0m"
    exit 1
fi

# Extract and install the binary
if [ "$FILE_EXT" == "zip" ]; then
    unzip "$TMP_DIR/scaf.$FILE_EXT" -d "$TMP_DIR"
    if [ $? -ne 0 ]; then
        echo -e "\033[0;31mFailed to unzip the file.\033[0m"
        exit 1
    fi
    mv "$TMP_DIR/scaf.exe" "$INSTALL_DIR/scaf.exe"
else
    tar -xzf "$TMP_DIR/scaf.$FILE_EXT" -C "$TMP_DIR"
    if [ $? -ne 0 ]; then
        echo -e "\033[0;31mFailed to extract the tarball.\033[0m"
        exit 1
    fi
    sudo mv "$TMP_DIR/scaf" "$INSTALL_DIR/scaf"
fi

# Make the binary executable (not needed for Windows)
if [ "$OS" != "windows" ]; then
    sudo chmod +x "$INSTALL_DIR/scaf"
fi

# Clean up
rm -rf "$TMP_DIR"

# Verify installation
if command -v scaf &> /dev/null; then
    echo "🎉 scaf successfully installed! 🎉"
    echo "Version: $VERSION"
    echo "Architecture: $ARCH-$TARGET"
else
    echo -e "\033[0;31mInstallation failed. Please check your installation directory and permissions.\033[0m"
    exit 1
fi
