import { Input } from "antd"

const CustomInput = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder
}) => {

  return (

    <div className="flex flex-col gap-2 w-full">

      <label className="font-medium text-gray-700">
        {label}
      </label>

      {type === "password" ? (

        <Input.Password
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          size="large"
        />

      ) : (

        <Input
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          size="large"
        />

      )}

    </div>

  )

}

export default CustomInput