//@todo make a version of this for list module
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