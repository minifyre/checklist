output.render=function(state)
{
	const
	[add,back,open]=['add','back','open'].map(fn=>evt=>input[fn](state,evt)),
	lists=['index',...state.view.path]
	.map(function(listId,i,path)
	{
		const
		item=state.file.data[listId],
		selected=path[i-1],
		items=item.list.map(function(id)
		{
			const
			item=state.file.data[id],
			data={}

			if(id===selected) attrs.data.selected=true

			return v('li',{data},
				v('span.icon',{},item.length||'+'),
				item.text
			)
		})

		return v('ul',{},...items)
	})

	return [v('header',{},
			v('button',{pointerup:back},'<'),
			v('input',{placeholder:'search',type:'text'}),
			v('button',{on:{pointerup:add}},'+')
		),
		v('main',{on:{pointerup:open}},...lists)
	]
}