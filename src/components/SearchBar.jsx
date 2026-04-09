import { Input } from "antd"
import { SearchOutlined } from "@ant-design/icons"

const SearchBar = ({ search, setSearch }) => {

  const handleChange = (e) => {
    setSearch(e.target.value)
  }

  return (

    <div className="w-full flex justify-center mt-6">

      <Input
        size="large"
        placeholder="Search food..."
        prefix={<SearchOutlined />}
        value={search}
        onChange={handleChange}
        className="max-w-md"
      />

    </div>

  )

}

export default SearchBar