import { FiSearch } from "react-icons/fi"

const Search = ({ value, onChange }) => {
  return (
	<div className="px-4 pb-3 pt-4">
		<label className="flex h-11 items-center gap-2.5 rounded-xl border border-[#e3e9e6] bg-[#f7f9f8] px-3.5 transition focus-within:border-[#9acdbb] focus-within:bg-white">
			<FiSearch aria-hidden="true" className="shrink-0 text-[#84918c]" size={16} />
		<input
			type="text"
			aria-label="Search contacts"
			placeholder="Search people"
			value={value}
			onChange={(event) => onChange(event.target.value)}
			className="min-w-0 flex-1 bg-transparent text-sm text-[#17211f] outline-none placeholder:text-[#9aa6a1]"
		/>
		</label>
	</div>
  )
}

export default Search