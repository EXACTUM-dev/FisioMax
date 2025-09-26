/**
 * Version: 1.0.1
 * ExerciseTestPage component for integration testing
 * Demonstrates full communication between frontend and backend with CRUD operations
 * Author: EXACTUM-dev
 */
import React, { useState } from "react";
import ExerciseList from "../organisms/exerciseList";
import { Title2, Title3, Paragraph2 } from "../atoms/typography";
import { UserButton } from "@clerk/clerk-react";
import Button from "../atoms/button";
import FormField from "../molecules/form";
import { exerciseApi } from "../api/exerciseApi";

export default function ExerciseTestPage() {
  // State for creating a new exercise
  const [newExercise, setNewExercise] = useState({
    name: "",
    category: "Upper Body",
    description: "",
    difficulty: "Beginner",
    muscleGroups: [],
    recommendedSets: 3,
    recommendedReps: "10-12",
  });

  // State for success/error messages
  const [message, setMessage] = useState({ text: "", type: "" });
  // State to refresh exercise list
  const [refresh, setRefresh] = useState(0);
  // State to toggle form visibility
  const [showForm, setShowForm] = useState(false);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExercise((prev) => ({ ...prev, [name]: value }));
  };

  // Handle multiple muscle groups input
  const handleMuscleGroupChange = (e) => {
    const value = e.target.value.split(",").map((item) => item.trim());
    setNewExercise((prev) => ({
      ...prev,
      muscleGroups: value,
    }));
  };

  // Submit form to create exercise
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await exerciseApi.create(newExercise);
      console.log("Exercise created:", response);

      setMessage({
        text: `Exercise \"${response.name}\" created successfully!`,
        type: "success",
      });

      // Reset form
      setNewExercise({
        name: "",
        category: "Upper Body",
        description: "",
        difficulty: "Beginner",
        muscleGroups: [],
        recommendedSets: 3,
        recommendedReps: "10-12",
      });

      setShowForm(false);
      setRefresh((prev) => prev + 1);

      setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 3000);
    } catch (error) {
      console.error("Error creating exercise:", error);
      setMessage({
        text: "Error creating exercise. Please try again.",
        type: "error",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Integration Test: Exercises (Frontend + Backend)
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                End-to-end testing with backend through REST API
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <UserButton
                afterSignOutUrl="/login"
                appearance={{
                  elements: {
                    avatarBox: "h-10 w-10",
                  },
                }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-8 max-w-7xl mx-auto">
        {/* API testing panel */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-start mb-6">
            <div>
              <Title2>API Control Panel</Title2>
              <Paragraph2>
                Test CRUD operations (Create, Read, Update, Delete) with backend
              </Paragraph2>
            </div>
            <Button
              label={showForm ? "Cancel" : "Create New Exercise"}
              variant={showForm ? "outline" : "brand"}
              onClick={() => setShowForm(!showForm)}
            />
          </div>

          {/* Success/Error messages */}
          {message.text && (
            <div
              className={`my-4 p-3 rounded-lg ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Exercise creation form */}
          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="bg-gray-50 p-4 rounded-lg mb-6"
            >
              <Title3 className="mb-4">Create New Exercise</Title3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Exercise Name"
                  name="name"
                  value={newExercise.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Push-up"
                />

                <FormField
                  label="Category"
                  name="category"
                  value={newExercise.category}
                  onChange={handleInputChange}
                  placeholder="Upper Body, Lower Body, Core"
                />

                <div className="col-span-1 md:col-span-2">
                  <FormField
                    label="Description"
                    name="description"
                    value={newExercise.description}
                    onChange={handleInputChange}
                    placeholder="Describe the exercise and how to perform it correctly"
                  />
                </div>

                <FormField
                  label="Difficulty"
                  name="difficulty"
                  value={newExercise.difficulty}
                  onChange={handleInputChange}
                  placeholder="Beginner, Intermediate, Advanced"
                />

                <FormField
                  label="Muscle Groups (comma separated)"
                  name="muscleGroups"
                  value={
                    Array.isArray(newExercise.muscleGroups)
                      ? newExercise.muscleGroups.join(", ")
                      : ""
                  }
                  onChange={handleMuscleGroupChange}
                  placeholder="e.g., Chest, Shoulders, Triceps"
                />

                <FormField
                  label="Recommended Sets"
                  name="recommendedSets"
                  value={newExercise.recommendedSets}
                  onChange={handleInputChange}
                  type="number"
                  placeholder="e.g., 3"
                />

                <FormField
                  label="Recommended Reps"
                  name="recommendedReps"
                  value={newExercise.recommendedReps}
                  onChange={handleInputChange}
                  placeholder="e.g., 10-12"
                />
              </div>

              <div className="mt-6 flex justify-end">
                <Button type="submit" label="Create Exercise" size="md" />
              </div>
            </form>
          )}

          {/* API technical details */}
          <div className="mt-4 border-t border-gray-100 pt-4">
            <Title3 className="text-sm">API Information</Title3>
            <ul className="mt-2 text-xs text-gray-500 space-y-1">
              <li>
                <strong>GET /api/exercises</strong> - Get all exercises
              </li>
              <li>
                <strong>GET /api/exercises/:id</strong> - Get exercise by ID
              </li>
              <li>
                <strong>POST /api/exercises</strong> - Create new exercise
              </li>
              <li>
                <strong>PUT /api/exercises/:id</strong> - Update exercise
              </li>
              <li>
                <strong>DELETE /api/exercises/:id</strong> - Delete exercise
              </li>
            </ul>
          </div>
        </div>

        {/* Exercise list, refreshed by state */}
        <div key={refresh}>
          <ExerciseList />
        </div>
      </main>
    </div>
  );
}
