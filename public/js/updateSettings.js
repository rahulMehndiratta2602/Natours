import axios from 'axios'
import { showAlert } from './alerts'

export const updateSettings = async (data, type) => {
    //console.log(data)
    const url = type === 'data'
        ? "/api/v1/users/updateMe"
        : "/api/v1/users/updatePassword"
    try {
        const res = await axios(
            {
                method: "PATCH",
                url,
                data
            }
        )
        //console.log(res)
        if (res.data.status === 'success') {
            showAlert('success', `${type.toUpperCase()} updated successfully`)
            window.setTimeout(() => {
                location.reload()
            }, 1500)
        }
    } catch (err) {
        // //console.log(err.response.data)
        showAlert('error', err.response.data.message)
    }
}