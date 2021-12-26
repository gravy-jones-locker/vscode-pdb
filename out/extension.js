"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const fs = require("fs");
function activate(context) {
    var bps = {};
    // Attach a command to update breakpoints whenever they are changed
    context.subscriptions.push(vscode.debug.onDidChangeBreakpoints((event) => {
        // Process any breakpoints which have been removed
        for (let bp of event.removed) {
            console.log(bp.id);
            delete bps[bp.id];
        }
        ;
        // Process any breakpoints which have been added
        for (let bp of event.added.concat(event.changed)) {
            let sbp = bp; // This seems stupid
            // Build a breakpoint string for pdbrc updating
            let sbppath = sbp.location.uri.path;
            let sbplnno = sbp.location.range.start.line + 1;
            var bpstr = 'b ' + sbppath + ':' + sbplnno;
            // Update that string with further breakpoint info
            if (bp.condition) {
                bpstr += ', ' + bp.condition;
            }
            ;
            console.log(bpstr);
            // Insert compound string into dictionary of breakpoints
            bps[bp.id] = bpstr;
        }
    }));
    // Attach the main debug command to the vscode context
    context.subscriptions.push(vscode.commands.registerCommand('extension.updatePdbrc', () => {
        // Get the path of the .pdbrc file to edit/create
        if (vscode.workspace.workspaceFolders) {
            var pdbrc = vscode.workspace.workspaceFolders[0].uri.path.concat('/.pdbrc');
        }
        else {
            var pdbrc = context.asAbsolutePath('').concat('/.pdbrc');
        }
        console.log(pdbrc);
        // Build a combined string and input into the .pdbrc file
        var pdbrcstr = '';
        for (let bpid in bps) {
            pdbrcstr += bps[bpid] + '\n';
        }
        fs.writeFileSync(pdbrc, pdbrcstr.slice(0, -1));
    }));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map