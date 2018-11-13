logic.edit=(state,id='')=>state.view.edit=id
logic.item=(...opts)=>util.mk({complete:false,text:'',list:[]},...opts)
logic.normalize=function(state)
{
	if(!state.file.data.index) state.file.data.index=logic.item({id:'index'})
	return state
}
logic.remove=function(state,id)
{
	//@todo delete all children
	//@todo if items chan have multiple parents, this needs to be overhauled

	//delete links to item
	Object.values(state.file.data)
	.forEach(function({list})
	{
		const i=list.indexOf(id)

		if(i!==-1) list.splice(i,1)
	})

	delete state.file.data[id]
}