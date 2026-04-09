import { useState, useMemo } from "react"

const useFoodSearch = (foods) => {

  const [search, setSearch] = useState("")

  const filteredFoods = useMemo(() => {

    return foods.filter((food) =>
      food.name.toLowerCase().includes(search.toLowerCase())
    )

  }, [search, foods])


  return {
    search,
    setSearch,
    filteredFoods
  }

}

export default useFoodSearch