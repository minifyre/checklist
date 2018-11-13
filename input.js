input.add=function(state)
{
	const
	{length}=state.view.path,
	parentId=length?state.view[length-1]:'index'

	logic.itemAdd(state,logic.item(),parentId)
}
input.back=function(state,evt)
{

}
input.blur=function(state,{target})
{
	const {id}=target

	if(util.empty(target.innerText)) logic.remove(state,id)
	else logic.itemUpdate(state,id,{text:target.innerText})

	logic.edit(state)
}
input.open=function(state,evt)
{

}