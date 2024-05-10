function Log(message)
{
    console.log("[Log] "+message);
}
function Warn(message)
{
    console.warn("[Warn] "+message);
}
function Debug(message)
{
    console.debug("[Debug] "+message);
}

module.exports = {Debug,Warn,Log};