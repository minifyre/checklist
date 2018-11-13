input.add=function(state)
{
	logic.itemAdd(state,logic.item(),logic.listLowest(state))
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

	//if list is empty, go back (no bugs on empty index list)
	if(!state.file.data[logic.listLowest(state)].list.length) logic.back(state)
}
input.open=function(state,{target})
{
	const {contenteditable,id}=target

	if(contenteditable) return
	if(state.view.path.indexOf(id)!==-1) return logic.openToggle(state,id)

	logic.open(state,id)
	//new item on empty list
	if(!state.file.data[id].list.length) input.add(state)
}
input.opts=function(state,evt)
{
	console.log('opts')
}