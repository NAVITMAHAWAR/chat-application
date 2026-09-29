

const Search = ({ value, onChange }) => {
  return (
	<div className="p-2">
		<input
			type="text"
			placeholder="Search"
			value={value}
			onChange={(event) => onChange(event.target.value)}
			className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none placeholder-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
		/>
	</div>
  )
}

export default Search