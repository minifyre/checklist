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