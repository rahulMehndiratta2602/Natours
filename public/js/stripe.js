import axios from "axios"
import { showAlert } from "./alerts"

const stripe = Stripe('pk_test_51Kf7XiSEjMiV0hYR3nWzlu4TqaIlILBe2y7KwqerjS24U97Fn4NN2RtPLvJ4I6IYyQ3yUQ6zmCntAhtoahCyX5J400tmJ235Z7')

export const bookTour = async tourId => {
    try {
        // 1) Get Checkout session from API
        const session = await axios(`http://127.0.0.1:5050/api/v1/bookings/checkout-session/${tourId}`)
        console.log(session)
        // 2) Create checkout form + sharge credit card
        console.log(session.data.session.url)
        // await stripe.redirectToCheckout({
        //     sessionId: session.data.session.id
        // })
        location.href = session.data.session.url

    } catch (err) {
        console.log(err)
        showAlert('error', err)
    }
}