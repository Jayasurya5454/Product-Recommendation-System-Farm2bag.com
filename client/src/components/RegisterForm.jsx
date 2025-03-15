import React, { useState, useEffect } from "react";
import { User, X } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase.js";
import { axiosInstance } from "../utils/axios.js";
import { useAppContext } from "./AppContext";

const RegisterForm = () => {
  const [user, setUser] = useState(null);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const { currentUser } = useAppContext();
  const [formData, setFormData] = useState({
    email: "",
    mobileNumber: "",
    age: "",
    gender: "",
    weight: "",
    height: "",
    medicalConditions: [],
    skinType: "",
    occupation: "",
    dietType: "none"
  });
  const [errors, setErrors] = useState({});

  // Predefined options for dropdowns
  const medicalConditionOptions = [
    'diabetes', 'skin health', 'eye health', 'bone health', 'immunity', 'heart health', 'hypertension', 'digestion', 'pregnancy', 'lactation', 'anemia', 'obesity', 'underweight', 'cholesterol', 'blood health', 'hair health', 'blood pressure', 'hydration', 'allergy', 'none'
  ];

  const skinTypeOptions = ['oily', 'dry', 'combination', 'normal'];
  const genderOptions = ["Male", "Female", "Other", "Prefer not to say"];
  const dietTypeOptions = [
    { value: "none", label: "None" },
    { value: "vegetarian", label: "Vegetarian" },
    { value: "vegan", label: "Vegan" },
    { value: "keto", label: "Keto" }
  ];
  const occupationOptions = ['athlete', 'businessman', 'homemaker', 'teenager', 'child', 'employee', 'senior citizen'];

  // Check if user is authenticated and load profile data if available
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Set email from Firebase auth
        setFormData(prevData => ({
          ...prevData,
          email: currentUser.email || ""
        }));
        
        // Check if user has completed profile
        try {
          const response = await axiosInstance.get(`/user/${currentUser.uid}`);
          
          // If we get a response, populate the form with existing data
          if (response.data) {
            const userData = response.data;
            setFormData({
              email: currentUser.email || userData.email || "",
              mobileNumber: userData.mobileNumber || "",
              age: userData.age || "",
              gender: userData.gender || "",
              weight: userData.weight || "",
              height: userData.height || "",
              medicalConditions: userData.medicalConditions || [],
              skinType: userData.skinType || "",
              occupation: userData.occupation || "",
              dietType: userData.dietType || "none"
            });
            
            // If mobile number exists, profile is considered complete
            if (userData.mobileNumber) {
              setProfileComplete(true);
            } else {
              // Show the form immediately if profile is not complete
              setShowProfileForm(true);
            }
          } else {
            // If no user data, show form
            setShowProfileForm(true);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          // If error (likely user not found), show form
          setShowProfileForm(true);
        }
      } else {
        // No user logged in
        setUser(null);
        setShowProfileForm(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleMedicalConditionsChange = (e) => {
    const value = e.target.value;
    const isChecked = e.target.checked;

    setFormData(prevState => {
      // If "None" is selected, clear all other selections
      if (value === "none" && isChecked) {
        return { ...prevState, medicalConditions: ["none"] };
      }

      // If another option is selected while "None" is active, remove "None"
      let updatedConditions = [...prevState.medicalConditions];
      if (isChecked) {
        if (updatedConditions.includes("none")) {
          updatedConditions = updatedConditions.filter(item => item !== "none");
        }
        updatedConditions.push(value);
      } else {
        updatedConditions = updatedConditions.filter(item => item !== value);
      }

      return { ...prevState, medicalConditions: updatedConditions };
    });
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Make all fields required
    if (!formData.mobileNumber) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = "Please enter a valid 10-digit mobile number";
    }

    if (!formData.age) {
      newErrors.age = "Age is required";
    } else if (isNaN(formData.age) || formData.age < 1 || formData.age > 120) {
      newErrors.age = "Please enter a valid age between 1 and 120";
    }

    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    if (!formData.weight) {
      newErrors.weight = "Weight is required";
    } else if (isNaN(formData.weight) || formData.weight < 1 || formData.weight > 500) {
      newErrors.weight = "Please enter a valid weight (kg)";
    }

    if (!formData.height) {
      newErrors.height = "Height is required";
    } else if (isNaN(formData.height) || formData.height < 50 || formData.height > 300) {
      newErrors.height = "Please enter a valid height (cm)";
    }

    if (!formData.occupation) {
      newErrors.occupation = "Occupation is required";
    }

    if (!formData.skinType) {
      newErrors.skinType = "Skin type is required";
    }

    if (formData.medicalConditions.length === 0) {
      newErrors.medicalConditions = "Please select at least one medical condition (or 'none')";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateBMI = () => {
    if (formData.weight && formData.height) {
      // Height in meters (convert from cm)
      const heightInMeters = formData.height / 100;
      const bmi = (formData.weight / (heightInMeters * heightInMeters)).toFixed(1);
      return bmi;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate BMI if height and weight are provided
      const bmi = calculateBMI();

      // Prepare the data to send
      const userData = {
        ...formData,
        userid: user.uid,
        bmi: bmi || undefined
      };

      // Convert string values to numbers where needed
      if (formData.age) userData.age = Number(formData.age);
      if (formData.weight) userData.weight = Number(formData.weight);
      if (formData.height) userData.height = Number(formData.height);

      // Submit the data
      await axiosInstance.put(`/user/${user.uid}`, userData);

      setProfileComplete(true);
      setShowProfileForm(false);
    } catch (error) {
      console.error("Error updating user details:", error);
      setErrors({ submit: "Failed to update user details. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleProfileForm = () => {
    setShowProfileForm(prev => !prev);
  };

  return (
    <>
      {/* Profile Button in Navbar */}
      {user && (
        <div 
          className="relative cursor-pointer flex items-center gap-2" 
          onClick={toggleProfileForm}
        >
          <User size={24} className="text-gray-700 dark:text-black" />
          <span className="text-sm hidden md:inline">Profile</span>
          {!profileComplete && (
            <span className="absolute -top-2 -right-2 h-4 w-4 bg-red-500 rounded-full"></span>
          )}
        </div>
      )}

      {/* Profile Form Modal */}
      {user && showProfileForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black" style={{ 
          backgroundColor: "rgba(0, 0, 0, 0.4)" }}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 transition-all duration-300 ease-in-out max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Your Profile</h2>
              <button 
                onClick={toggleProfileForm} 
                className="text-gray-400 hover:text-gray-600"
                disabled={isSubmitting}
              >
                <X size={24} />
              </button>
            </div>
            
            {errors.submit && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                {errors.submit}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    // onChange={handleChange}
                    placeholder="Enter your email address"
                    className={`mt-1 block w-full rounded-md border ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    } px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
                
                {/* Mobile Number */}
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    placeholder="Enter your 10-digit mobile number"
                    className={`mt-1 block w-full rounded-md border ${
                      errors.mobileNumber ? 'border-red-500' : 'border-gray-300'
                    } px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500`}
                  />
                  {errors.mobileNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.mobileNumber}</p>
                  )}
                </div>
                
                {/* Age */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="Your age"
                    className={`mt-1 block w-full rounded-md border ${
                      errors.age ? 'border-red-500' : 'border-gray-300'
                    } px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500`}
                  />
                  {errors.age && (
                    <p className="mt-1 text-sm text-red-600">{errors.age}</p>
                  )}
                </div>
                
                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border ${
                      errors.gender ? 'border-red-500' : 'border-gray-300'
                    } px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500`}
                  >
                    <option value="">Select gender</option>
                    {genderOptions.map(option => (
                      <option key={option} value={option.toLowerCase()}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {errors.gender && (
                    <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
                  )}
                </div>
                
                {/* Weight */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Weight (kg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="Your weight in kg"
                    className={`mt-1 block w-full rounded-md border ${
                      errors.weight ? 'border-red-500' : 'border-gray-300'
                    } px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500`}
                  />
                  {errors.weight && (
                    <p className="mt-1 text-sm text-red-600">{errors.weight}</p>
                  )}
                </div>
                
                {/* Height */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Height (cm) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    placeholder="Your height in cm"
                    className={`mt-1 block w-full rounded-md border ${
                      errors.height ? 'border-red-500' : 'border-gray-300'
                    } px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500`}
                  />
                  {errors.height && (
                    <p className="mt-1 text-sm text-red-600">{errors.height}</p>
                  )}
                </div>
                
                {/* Occupation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Occupation <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border ${
                      errors.occupation ? 'border-red-500' : 'border-gray-300'
                    } px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500`}
                  >
                    <option value="">Select occupation</option>
                    {occupationOptions.map(option => (
                      <option key={option} value={option.toLowerCase()}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {errors.occupation && (
                    <p className="mt-1 text-sm text-red-600">{errors.occupation}</p>
                  )}
                </div>
                
                {/* Diet Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Diet Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="dietType"
                    value={formData.dietType}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                  >
                    {dietTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Skin Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Skin Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="skinType"
                    value={formData.skinType}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border ${
                      errors.skinType ? 'border-red-500' : 'border-gray-300'
                    } px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500`}
                  >
                    <option value="">Select skin type</option>
                    {skinTypeOptions.map(option => (
                      <option key={option} value={option.toLowerCase()}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {errors.skinType && (
                    <p className="mt-1 text-sm text-red-600">{errors.skinType}</p>
                  )}
                </div>
                
                {/* Medical Conditions */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medical Conditions <span className="text-red-500">*</span>
                  </label>
                  {errors.medicalConditions && (
                    <p className="mb-2 text-sm text-red-600">{errors.medicalConditions}</p>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {medicalConditionOptions.map((condition) => (
                      <div key={condition} className="flex items-center">
                        <input
                          type="checkbox"
                          id={condition}
                          name="medicalConditions"
                          value={condition}
                          checked={formData.medicalConditions.includes(condition)}
                          onChange={handleMedicalConditionsChange}
                          className="h-4 w-4 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <label htmlFor={condition} className="ml-2 text-sm text-gray-700">
                          {condition}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 rounded hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-300 flex items-center"
                >
                  {isSubmitting && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  )}
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default RegisterForm;