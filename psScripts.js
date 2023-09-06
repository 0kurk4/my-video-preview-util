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

const spawn = require("child_process").spawn;

const variants = [psScriptFolderBrowser, psScriptGetFile];

//async function openDialog(result, error, variant = 1) {
async function openDialog(result, error, variant) {
    const child = spawn("powershell.exe", [variants[variant]]);
    child.stdout.on("data",function(data){
        console.log("Powershell Data: " + data);
        return result(data);
    });
    child.stderr.on("data",function(data){
        //this script block will get the output of the PS script
        console.log("Powershell Errors: " + data);
        return error(data);
    });
    child.on("exit",function(){
        console.log("Powershell Script finished");
    });
    child.stdin.end(); //end input  
}

module.exports = {
    openDialog
}