// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

function getCursorPosition() {
    const editor = vscode.window.activeTextEditor;
    if (editor.selection.isEmpty) {
        const position = editor.selection.active;
        return position;
    }
}

function setCursorPosition(position) {
    const editor = vscode.window.activeTextEditor;
    var newSelection = new vscode.Selection(position, position);
    editor.selection = newSelection;
}

function newPositionForText(currentPosition, text, numberOfCharacters) {
    var newPosition = currentPosition;

    for (let i = 0, end = text.length-1, asc = 0 <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {
      if (i === numberOfCharacters) {
        break;
      }
      if (text[i] === "\n") {
        newPosition = new vscode.Position(newPosition.line + 1, 0);
      } else {
        newPosition = new vscode.Position(newPosition.line, newPosition.character + 1);
      }

    }

    return newPosition;
}

function getCurrentFilename() {
    const editor = vscode.window.activeTextEditor;
    return editor.document.fileName;
}

function getTextRangeFromBeginningOfLineToCursor() {
    const cursorPosition = getCursorPosition();
    const cursorLine = cursorPosition.line;

    const cursorPoint = new vscode.Position(cursorLine, cursorPosition.character);
    const beginningLinePoint = new vscode.Position(cursorLine, 0);
    return new vscode.Range(beginningLinePoint, cursorPoint);
}

function getTextFromBeginningOfLineToCursor() {
    const editor = vscode.window.activeTextEditor;
    const document = editor.document;
    const range = getTextRangeFromBeginningOfLineToCursor();
    return document.getText(range);
}

function replaceText(text, cursorPosition) {
    const editor = vscode.window.activeTextEditor;
    var currentCursorPosition = new vscode.Position(getCursorPosition().line, 0);
    editor.edit(builder => {
        const range = getTextRangeFromBeginningOfLineToCursor();
        builder.delete(range);
        builder.insert(currentCursorPosition, text);
    });

    const newPosition = newPositionForText(currentCursorPosition, text, cursorPosition);
    setCursorPosition(newPosition);
}

function handleJson(json) {
    if (json === null) {
        return;
    }

    const data = JSON.parse(json);
    if (data === null) {
        return;
    }

    const newText = data["text"];
    const cursorPosition = data["cursorPosition"];
    replaceText(newText, cursorPosition);
}

function executeCommand(command) {
    const { exec } = require('child_process');
    return exec(command, function(error, stdout, stderr) {
        if (stdout) {
            console.log(stdout);
            handleJson(stdout);
        }
        if (stderr) {
            vscode.window.showInformationMessage("Could not run TeaCode. Please make sure it's installed. You can download the app from www.apptorium.com/teacode");
        }
    });
}

function runScript() {
    const extensionPath = vscode.extensions.getExtension("Apptorium.teacode-vsc-helper").extensionPath;
    const scriptPath = extensionPath + "/expand.sh";
    const fileExtension = getCurrentFilename().split('.').pop();
    const text = getTextFromBeginningOfLineToCursor();

    if ((text === null) || (text === "")) {
      return;
    }

    const command = `sh ${scriptPath} -e \"${fileExtension}\" -t \"${text}\"`;
    executeCommand(command)
  }

function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.expand', function () {
        runScript();
    });

    context.subscriptions.push(disposable);
}
exports.activate = activate;

function deactivate() {

}
exports.deactivate = deactivate;