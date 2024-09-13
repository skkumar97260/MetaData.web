import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveToken } from "../../utils/Storage"; // Placeholder for token storage function
import { isAuthenticated } from "../../utils/Auth"; // Placeholder for authentication check
import { toast } from "react-toastify";
import { loginuser,verifyOtp } from "../../api/login";

const Login = () => {
    const navigate = useNavigate();
    const initialStateInputs = {
        phoneNumber: "",
        otp: "",
    };
    const initialStateErrors = {
        phoneNumber: { required: false, valid: true },
        otp: { required: false, valid: true },
    };
    const [inputs, setInputs] = useState(initialStateInputs);
    const [errors, setErrors] = useState(initialStateErrors);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState(new Array(5).fill(""));

    const handleInputs = (e) => {
        const { name, value } = e.target;
        setInputs((prevInputs) => ({
            ...prevInputs,
            [name]: value,
        }));

        if (isSubmitted) {
            const newErrors = handleValidation({ ...inputs, [name]: value });
            setErrors(newErrors);
        }
    };

    const handleValidation = (data) => {
        const newErrors = { ...initialStateErrors };
        if (data.phoneNumber === "") {
            newErrors.phoneNumber.required = true;
            newErrors.phoneNumber.valid = false;
        }
        if (data.otp === "" && otpSent) {
            newErrors.otp.required = true;
            newErrors.otp.valid = false;
        }
        return newErrors;
    };

    const handleErrors = (errors) => {
        return Object.values(errors).every((error) => error.valid);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setIsSubmitted(true);
        const newErrors = handleValidation(inputs);
        setErrors(newErrors);
        if (handleErrors(newErrors)) {
            loginuser(inputs)
                .then((res) => {
                    toast.success(res?.data?.message);
                    setOtpSent(true);
                })
                .catch((err) => {
                    toast.error(err?.response?.data?.message);
                });
        } else {
            toast.error("Please fill out all required fields correctly.");
        }
    };

    const handleOtpVerify = async (event) => {
        event.preventDefault();
        setIsSubmitted(true);
        const newErrors = handleValidation(inputs);
        setErrors(newErrors);
        if (handleErrors(newErrors)) {
            const data = {
                phoneNumber: inputs.phoneNumber,
                otp: inputs.otp,
            };
            verifyOtp(data)
                .then((res) => {
                    const token = res?.data?.token;
                    const userId = res?.data?.result?._id;
                    saveToken({ token, userId });
                    if (isAuthenticated()) {
                        navigate('/'); // Redirect to dashboard after successful login
                    }
                    toast.success(res?.data?.message);
                })
                .catch((err) => {
                    toast.error(err?.response?.data?.message);
                });
        } else {
            toast.error("Please enter a valid OTP.");
        }
    };

    const handleOtpChange = (element, index) => {
        const value = element.value;
        if (/^\d$/.test(value) || value === "") {
            let newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);
            setInputs((prevInputs) => ({
                ...prevInputs,
                otp: newOtp.join(""),
            }));
            // Move focus to next input box if value is not empty
            if (value !== "" && index < 4) {
                document.getElementById(`otp-input-${index + 1}`).focus();
            }
        }
    };

    const handleOtpKeyDown = (e, index) => {
        if (e.key === "Backspace" && otp[index] === "" && index > 0) {
            document.getElementById(`otp-input-${index - 1}`).focus();
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-4">
            <div className="mockup-phone border-primary shadow-lg">
                <div className="camera bg-gray-900"></div>
                <div className="display bg-white p-6 rounded-lg">
                    <div className="artboard artboard-demo phone-1 p-4">
                        <h1 className="text-3xl font-bold text-center mb-6 text-indigo-600">Login</h1>
                        <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
                            <div className="flex flex-col gap-1">
                                <label className="text-lg font-medium" htmlFor="phoneNumber">Mobile Number</label>
                                <input
                                    type="text"
                                    placeholder="Enter your mobile number"
                                    name="phoneNumber"
                                    value={inputs.phoneNumber}
                                    onChange={handleInputs}
                                    className="input input-bordered w-full"
                                    required
                                />
                                {errors.phoneNumber.required && (
                                    <span className="text-danger form-text">Mobile number is required</span>
                                )}
                            </div>
                            <button className="btn btn-primary w-full mt-4" type="submit">
                                Submit
                            </button>
                        </form>

                        {otpSent && (
                            <div className="flex flex-col gap-2 mt-6">
                                <label className="text-lg font-medium" htmlFor="otp">Enter OTP</label>
                                <div className="flex gap-2 justify-center">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            id={`otp-input-${index}`}
                                            type="text"
                                            maxLength="1"
                                            value={digit}
                                            onChange={(e) => handleOtpChange(e.target, index)}
                                            onKeyDown={(e) => handleOtpKeyDown(e, index)}
                                            className="input input-bordered text-center w-12 h-12 text-xl font-semibold"
                                            required
                                        />
                                    ))}
                                </div>
                                <button
                                    className="btn btn-secondary w-full mt-4"
                                    onClick={handleOtpVerify}
                                >
                                    Verify OTP
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
