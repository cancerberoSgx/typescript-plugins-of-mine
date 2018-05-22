import * as ts from "typescript";
import * as fs from "fs";

interface Replacement {
    start: number;
    end: number;
    replacementText: string;
}

function transformProgram(program: ts.Program) {
    for (const file of program.getSourceFiles()) {
        const replacements = getReplacements(file);
        replacements.reverse();

        const newText = getNewText(file.getText(), replacements);
        fs.writeFileSync(file.fileName, newText);
    }
}

function getReplacements(sourceFile: ts.SourceFile) {
    const replacements: Replacement[] = [];
    for (const statement of sourceFile.statements) {
        if (statement.kind !== ts.SyntaxKind.ImportEqualsDeclaration) {
            continue;
        }

        const importEquals = statement as ts.ImportEqualsDeclaration;
        if (importEquals.moduleReference.kind !== ts.SyntaxKind.ExternalModuleReference) {
            continue;
        }

        const importString = (importEquals.moduleReference as ts.ExternalModuleReference).expression as ts.StringLiteral;
        if (!importString || importString.kind !== ts.SyntaxKind.StringLiteral) {
            continue;
        }

        replacements.push({
            start: statement.getStart(),
            end: statement.getEnd(),
            replacementText: `import ${ importEquals.name.getText() } from "${ importString.getText() }";`
        });
    }
    return replacements;
}

function getNewText(sourceText: string, replacementsInReverse: Replacement[]) {
    for (const { start, end, replacementText } of replacementsInReverse) {
        sourceText = sourceText.slice(0, start) + replacementText + sourceText.slice(end)
    }

    return sourceText;
}