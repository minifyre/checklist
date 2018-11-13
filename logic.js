logic.edit=(state,id='')=>state.view.edit=id
logic.item=(...opts)=>util.mk({complete:false,text:'',list:[]},...opts)
logic.normalize=function(state)
{
	if(!state.file.data.index) state.file.data.index=logic.item({id:'index'})
	return state
}
