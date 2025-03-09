import { useState, useEffect } from "react";
import { axiosInstance } from "../utils/axios.js";
import { useAppContext } from "../components/AppContext";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase.js";

const UserRegistrationForm = () => {
  const [user, setUser] = useState(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [formData, setFormData] = useState({
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
  const medicalConditionOptions = ["Diabetes", "Hypertension", "Heart Disease", "Asthma", "Thyroid", "Allergies", "Arthritis", "None"];
  const skinTypeOptions = ["Normal", "Dry", "Oily", "Combination", "Sensitive"];
  const genderOptions = ["Male", "Female", "Other", "Prefer not to say"];
  const dietTypeOptions = [
    { value: "none", label: "None" },
    { value: "vegetarian", label: "Vegetarian" },
    { value: "vegan", label: "Vegan" },
    { value: "keto", label: "Keto" }
  ];
  const occupationOptions = [
    "Student", 
    "Professional", 
    "Business Owner", 
    "Homemaker", 
    "Retired", 
    "Healthcare Worker", 
    "Teacher/Educator", 
    "IT Professional",
    "Other"
  ];

  // Check if user is authenticated and if they need to complete registration
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Check if user has completed registration
        try {
          const response = await axiosInstance.get(`/user/${currentUser.uid}`);
          const userData = response.data.user;
          
          // If mobileNumber is missing, user needs to complete registration
          if (!userData.mobileNumber) {
            setShowRegistration(true);
          } else {
            setRegistrationComplete(true);
          }
        } catch (error) {
          console.error("Error checking user registration status:", error);
          setShowRegistration(true);
        }
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
      if (value === "None" && isChecked) {
        return { ...prevState, medicalConditions: ["None"] };
      }
      
      // If another option is selected while "None" is active, remove "None"
      let updatedConditions = [...prevState.medicalConditions];
      if (isChecked) {
        if (updatedConditions.includes("None")) {
          updatedConditions = updatedConditions.filter(item => item !== "None");
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
    
    if (!formData.mobileNumber) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = "Please enter a valid 10-digit mobile number";
    }
    
    if (formData.age && (isNaN(formData.age) || formData.age < 1 || formData.age > 120)) {
      newErrors.age = "Please enter a valid age between 1 and 120";
    }
    
    if (formData.weight && (isNaN(formData.weight) || formData.weight < 1 || formData.weight > 500)) {
      newErrors.weight = "Please enter a valid weight (kg)";
    }
    
    if (formData.height && (isNaN(formData.height) || formData.height < 50 || formData.height > 300)) {
      newErrors.height = "Please enter a valid height (cm)";
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
        email: user.email,
        bmi: bmi || undefined
      };
      
      // Convert string values to numbers where needed
      if (formData.age) userData.age = Number(formData.age);
      if (formData.weight) userData.weight = Number(formData.weight);
      if (formData.height) userData.height = Number(formData.height);
      
      // Submit the data
      await axiosInstance.put(`/user/${user.uid}`, userData);
      
      setRegistrationComplete(true);
      setShowRegistration(false);
    } catch (error) {
      console.error("Error updating user details:", error);
      setErrors({ submit: "Failed to update user details. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    try {
      // Just update mobile number which is required
      if (formData.mobileNumber && /^\d{10}$/.test(formData.mobileNumber)) {
        await axiosInstance.put(`/user/${user.uid}`, {
          userid: user.uid,
          email: user.email,
          mobileNumber: formData.mobileNumber
        });
        setRegistrationComplete(true);
        setShowRegistration(false);
      } else {
        setErrors({ mobileNumber: "Mobile number is required to continue" });
      }
    } catch (error) {
      console.error("Error updating minimal user details:", error);
      setErrors({ submit: "Failed to update user details. Please try again." });
    }
  };

  if (!user || !showRegistration) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black"style={{ 
            backgroundColor: "rgba(0, 0, 0, 0.4)" }}>
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 transition-all duration-300 ease-in-out">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Complete Your Profile</h2>
          <button 
            onClick={handleSkip} 
            className="text-gray-400 hover:text-gray-600"
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>
        
        {errors.submit && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {errors.submit}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mobile Number - Required */}
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
              <label className="block text-sm font-medium text-gray-700">Age</label>
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
            
            {/* Gender - Dropdown instead of free text */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              >
                <option value="">Select gender</option>
                {genderOptions.map(option => (
                  <option key={option} value={option.toLowerCase()}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
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
              <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
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
            
            {/* Occupation - Dropdown instead of free text */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Occupation</label>
              <select
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              >
                <option value="">Select occupation</option>
                {occupationOptions.map(option => (
                  <option key={option} value={option.toLowerCase()}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Diet Type - Already a controlled dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Diet Type</label>
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
            
            {/* Skin Type - Dropdown instead of free text */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Skin Type</label>
              <select
                name="skinType"
                value={formData.skinType}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              >
                <option value="">Select skin type</option>
                {skinTypeOptions.map(option => (
                  <option key={option} value={option.toLowerCase()}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Medical Conditions - Checkboxes for predefined conditions */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Medical Conditions</label>
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
          
          <div className="flex justify-between pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleSkip}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              Skip for Now
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 rounded hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-300 flex items-center"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              )}
              Complete Registration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserRegistrationForm;