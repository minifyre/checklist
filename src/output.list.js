output.render=function(state)
{
	const
	move=state.view.move.filter(x=>!!x),
	[pointerup,mkList]=[input,output.list].map(fn=>util.curry(fn,state)),
	[path,filter]=move.length?[move,id=>!state.view.selected.includes(id)]:[state.view.path,()=>true],
	lists=path.filter(x=>!!x).map(util.curry(mkList,filter)),
	main=v('main',{data:{view:state.view.layout},on:{pointerup}},...lists)

	return [output.header(state),main]
}