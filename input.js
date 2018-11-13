input.add=function(state,evt)
{

}
input.back=function(state,evt)
{

}
input.blur=function(state,{target})
{
	if(util.empty(target.innerText)) logic.remove(state,target.id)

	logic.edit(state)
}
input.open=function(state,evt)
{

}