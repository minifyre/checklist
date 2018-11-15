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
{//@todo this should rerender parent's length icon
	const {id}=target.parentElement

	if(util.empty(target.innerText))
	{
		if(util.empty(state.file.data[id].text)) logic.remove(state,id)
		else target.innerHTML=state.file.data[id].text
		//previous line is necessary as the text has not changed 
			//in the virtual dom & so it will not get re-rendered
	}
	else logic.itemUpdate(state,id,{text:target.innerText})

	logic.edit(state)

	//if list is empty, go back (no bugs on empty index list)
	if(!state.file.data[logic.listLowest(state)].list.length) logic.back(state)
}
input.complete=state=>logic.complete(state)
input.delete=function(state)
{
	//remove deleted items from path
	const i=state.view.path.findIndex(id=>state.view.path.includes(id))
	if(i!==-1) state.view.path=state.view.path.slice(0,i)

	state.view.selected.forEach(id=>logic.remove(state,id))

	logic.deselectAll(state)
}
input.deselect=logic.deselectAll
input.edit=function(state)
{
	const id=state.view.selected[0]
	logic.deselectAll(state)
	logic.edit(state,id)
}
input.open=function(state,{target})
{
	const {id}=target

	if(target.querySelector('[contenteditable]')) return
	if(state.view.path.indexOf(id)!==-1) return logic.openToggle(state,id)
	if(target.querySelector('[data-completed="true"]')) return

	logic.open(state,id)
	//new item on empty list
	if(!state.file.data[id].list.length) input.add(state)
}
input.opts=function(state,evt)
{
	console.log('options menu')
}
input.toggleSelect=(state,{target})=>logic.toggleSelect(state,target.parentElement.id)