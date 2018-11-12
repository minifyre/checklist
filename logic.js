logic.normalize=function(state)
{
	if(!state.file.data.index) state.file.data.index=logic.item({id:'index'})
	return state
}
logic.item=(...opts)=>util.mk({complete:false,text:'',list:[]},...opts)