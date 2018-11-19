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
	const
	{innerText:text}=target,
	{id}=target.parentElement,
	repeat=/X:\d+-\d+/

	if(util.empty(text))
	{
		if(util.empty(state.file.data[id].text)) logic.remove(state,id)
		else target.innerHTML=state.file.data[id].text
		//previous line is necessary as the text has not changed 
			//in the virtual dom & so it will not get re-rendered
	}
	else if(text.match(repeat))//@todo should this be moved into logic.itemAdd?
	{
		const
		[replace]=text.match(repeat),//X:11-2
		[min,max]=replace.split(':')[1]//11-2
				.split('-')//[11','2']
				.map(d=>parseInt(d))//[11,2]
				.sort((a,b)=>a-b),//[2,11]//sort() will keep 11 in front
		[val,...vals]=Array(max-min+1)
					.fill(min)
					.map((d,i)=>d+i)
					.map(d=>text.replace(repeat,d)),
		parentId=logic.parent(state,id),
		childIndex=state.file.data[parentId].list.indexOf(id)

		logic.itemUpdate(state,id,{text:val})

		vals.forEach((text,i)=>logic.itemAdd(state,logic.item({text}),parentId,childIndex+i+1))
	}
	else logic.itemUpdate(state,id,{text})

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