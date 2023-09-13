// PowerShell script for invoking Select File system dialog
const psScriptGetFile = `
Function Get-File
{
 [System.Reflection.Assembly]::LoadWithPartialName("System.windows.forms") |
     Out-Null     

   $objForm = New-Object System.Windows.Forms.OpenFileDialog
        $objForm.filter = 'All files (*.*)|*.*'
        $Show = $objForm.ShowDialog()
        If ($Show -eq "OK")
        {
            Return $objForm.FileName
        }
        Else
        {
            Write-Error "Operation cancelled by user."
        }
    }

$file = Get-File # the variable contains user folder selection
write-host $file
`;

// PowerShell script for invoking Select Folder system dialog
// taken from https://stackoverflow.com/questions/11412617/get-a-folder-path-from-the-explorer-menu-to-a-powershell-variable
const psScriptFolderBrowser = `
Function Select-FolderDialog
{
    param([string]$Description="Select Folder",[string]$RootFolder="Desktop")

 [System.Reflection.Assembly]::LoadWithPartialName("System.windows.forms") |
     Out-Null     

   $objForm = New-Object System.Windows.Forms.FolderBrowserDialog
        $objForm.Rootfolder = $RootFolder
        $objForm.Description = $Description
        $Show = $objForm.ShowDialog()
        If ($Show -eq "OK")
        {
            Return $objForm.SelectedPath
        }
        Else
        {
            Write-Error "Operation cancelled by user."
        }
    }

$folder = Select-FolderDialog # the variable contains user folder selection
write-host $folder
`;

/**
 * NodeJS utility for invoking PowerShell process
 * the script is taken from https://stackoverflow.com/questions/51655571/how-to-open-a-select-folder-dialog-from-nodejs-server-side-not-browser
 * 
 * WARNING: The scripts will run only on Windows-based machine.
*/
const spawn = require("child_process").spawn;
const variants = [psScriptFolderBrowser, psScriptGetFile];

async function openDialog(result, error, variant) {
    const child = spawn("powershell.exe", [variants[variant]]);
    child.stdout.on("data",function(data){
        console.log("Powershell Data: " + data);
        return result(data);
    });
    child.stderr.on("data",function(data){
        console.log("Powershell Errors: " + data);
        return error(data);
    });
    child.on("exit",function(){
        console.log("Powershell Script finished");
    });
    child.stdin.end();
}

module.exports = {
    openDialog
}