logic.complete=function(state,deselectAll=true)
{
	const
	{data}=state.file,
	ids=deselectAll===true?state.view.selected:deselectAll

	ids
	.map(id=>data[id])
	.forEach(function(item)
	{
		//@todo can this cause overflow?
			//put after parent is changed?
		logic.complete(state,item.list)
		item.complete=true
	})

	if(deselectAll) logic.deselectAll(state)
}
logic.isComplete=(state,id)=>(state.file.data[id]||{}).complete
//@todo if child items are marked uncomplete, 
	//go through their parents & mark them uncomplete as well
//@todo what should happen if a parent is uncompleted?
	//should all of its children be uncompleted as well?
logic.repeat=(state,...ids)=>ids.forEach(id=>state.file.data[id].complete=false)