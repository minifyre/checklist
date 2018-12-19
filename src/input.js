input.add=function(state)
{
	logic.itemAdd(state,logic.item(),logic.listLowest(state))
}
input.back=logic.back
input.backOrOpts=function(state,evt)
{
	(state.view.path.length?input.back:input.opts)(state,evt)
}
input.blur=function(state,{target})
{
	const
	{innerText:text}=target,
	{id}=target.parentElement

	if(util.empty(text))
	{
		if(util.empty(state.file.data[id].text)) logic.remove(state,id)
		else target.innerHTML=state.file.data[id].text
		//previous line is necessary as the text has not changed 
			//in the virtual dom & so it will not get re-rendered
	}
	else
	{
		const
		[val,...vals]=util.txt2txts(text),
		parentId=logic.parent(state,id),
		childIndex=state.file.data[parentId].list.indexOf(id)
	
		target.innerHTML=val
		logic.itemUpdate(state,id,{text:val})
	
		vals.forEach((text,i)=>logic.itemAdd(state,logic.item({text}),parentId,childIndex+i+1))	
	}

	logic.edit(state)

	//if list is empty, go back (no bugs on empty index list)
	if(!state.file.data[logic.listLowest(state)].list.length) logic.back(state)
}
input.complete=state=>logic.complete(state)
input.delete=function(state)
{
	//remove deleted items from path
	const
	indexes=state.view.selected
			.map(id=>state.view.path.indexOf(id))
			.filter(i=>i!==-1),
	i=indexes.length?Math.min(...indexes):-1

	if(i!==-1) state.view.path=state.view.path.slice(0,i)

	state.view.selected.forEach(id=>logic.remove(state,id))

	logic.deselectAll(state)
}
input.download=function(state)
{
	const clone=util.clone(state.file)
	delete clone.id

	const
	file=new Blob([JSON.stringify(clone)],{type:'text/plain'}),
	download=clone.meta.name,
	href=URL.createObjectURL(file),
	link=Object.assign(document.createElement('a'),{download,href})

	document.body.appendChild(link)
	link.click()
	link.remove()
}
input.deselect=logic.deselectAll
input.edit=function(state)
{
	const id=state.view.selected[0]
	logic.deselectAll(state)
	logic.edit(state,id)
}
input.move=logic.move
input.moveHere=function(state)
{//@todo move state assignments into logic
	const
	children=state.view.selected.slice(),
	parent=state.view.move.slice(-1),
	//made sure state.view.path does not have moved items
	i=state.view.path.findIndex(id=>children.includes(id))

	if(i!==-1) state.view.path=state.view.path.slice(0,i)

	logic.deselectAll(state)
	logic.moveItems(state,parent,children)
	state.view.move=[]//@todo move into logic
}
input.open=function(state,{target})
{
	const
	{id}=target,
	path=logic.path(state)

	if(target.querySelector('[contenteditable]')) return
	//@todo merge open & openToggle? 
		//if so, will need check if item is open before addeing a new item to 
		//an empty parent list
	if(path.indexOf(id)!==-1) return logic.openToggle(state,id)

	logic.open(state,id)

	if(!state.file.data[id].list.length) input.add(state)
}
input.opts=function(state,evt)
{
	console.log('options menu')
}
input.repeat=function(state)
{
	if(state.view.selected.length)
	{
		logic.repeat(state,...state.view.selected)
		logic.deselectAll(state)
	}
	else
	{
		const completed=state.file.data[logic.listLowest(state)].list
		.filter(id=>state.file.data[id].complete)
		logic.repeat(state,...completed)
	}	
}
input.shuffle=state=>logic.shuffle(state)
input.toggleSelect=function(state,{target})
{
	if(logic.mode(state)==='move') input.open(state,{target:target.parentElement})
	else logic.toggleSelect(state,target.parentElement.id)
}