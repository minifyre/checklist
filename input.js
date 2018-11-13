input.add=function(state)
{
	const
	{length}=state.view.path,
	parentId=length?state.view.path[length-1]:'index'

	logic.itemAdd(state,logic.item(),parentId)
}
input.backOrOpts=function(state,evt)
{
	(state.view.path.length?input.back:input.opts)(state,evt)
}
input.back=logic.back
input.blur=function(state,{target})
{
	const {id}=target

	if(util.empty(target.innerText)) logic.remove(state,id)
	else logic.itemUpdate(state,id,{text:target.innerText})

	logic.edit(state)
	//@todo if item was only child, go back
}
input.open=function(state,{target})
{
	const {contenteditable,id}=target

	if(contenteditable||state.view.path.indexOf(id)!==-1) return

	logic.open(state,id)
	//new item on empty list
	if(!state.file.data[id].list.length) input.add(state)
}
input.opts=function(state,evt)
{
	console.log('opts')
}