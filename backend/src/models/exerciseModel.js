/**
 * Version: 0.1.0
 * Exercise model
 * Defines the structure and operations for exercise data
 */

// Mock data for exercises
const exercisesMock = [
  {
    id: 1,
    name: "Shoulder Press",
    category: "Upper Body",
    description: "Lift weights above your head with controlled movements",
    difficulty: "Intermediate",
    muscleGroups: ["Shoulders", "Triceps"],
    imageUrl: "https://example.com/shoulder-press.jpg",
    videoUrl: "https://example.com/shoulder-press-video",
    recommendedSets: 3,
    recommendedReps: "8-12",
  },
  {
    id: 2,
    name: "Squat",
    category: "Lower Body",
    description: "Bend your knees and lower your body as if sitting on a chair",
    difficulty: "Beginner",
    muscleGroups: ["Quadriceps", "Hamstrings", "Glutes"],
    imageUrl: "https://example.com/squat.jpg",
    videoUrl: "https://example.com/squat-video",
    recommendedSets: 4,
    recommendedReps: "10-15",
  },
  {
    id: 3,
    name: "Plank",
    category: "Core",
    description: "Hold your body in a straight line from head to feet",
    difficulty: "Beginner",
    muscleGroups: ["Abdominals", "Lower Back"],
    imageUrl: "https://example.com/plank.jpg",
    videoUrl: "https://example.com/plank-video",
    recommendedSets: 3,
    recommendedReps: "30-60 seconds",
  },
];

// Initial ID for new exercises
let nextId = 4;

/**
 * Exercise data model with CRUD operations
 */
const exerciseModel = {
  /**
   * Get all exercises with optional filtering
   * @param {Object} filters - Optional filters (category, difficulty, etc.)
   * @return {Promise} Promise object with filtered exercises
   */
  getAll: (filters = {}) => {
    let result = [...exercisesMock];

    // Apply filters if provided
    if (filters.category) {
      result = result.filter((ex) => ex.category === filters.category);
    }

    if (filters.difficulty) {
      result = result.filter((ex) => ex.difficulty === filters.difficulty);
    }

    if (filters.muscleGroup) {
      result = result.filter((ex) =>
        ex.muscleGroups.includes(filters.muscleGroup)
      );
    }

    return Promise.resolve(result);
  },

  /**
   * Get a single exercise by ID
   * @param {Number} id - Exercise ID
   * @return {Promise} Promise object with exercise or null
   */
  getById: (id) => {
    const exercise = exercisesMock.find((ex) => ex.id === parseInt(id));
    return Promise.resolve(exercise || null);
  },

  /**
   * Create a new exercise
   * @param {Object} exerciseData - Exercise data object
   * @return {Promise} Promise object with created exercise
   */
  create: (exerciseData) => {
    const newExercise = {
      id: nextId++,
      ...exerciseData,
    };
    exercisesMock.push(newExercise);
    return Promise.resolve(newExercise);
  },

  /**
   * Update an existing exercise
   * @param {Number} id - Exercise ID
   * @param {Object} exerciseData - New exercise data
   * @return {Promise} Promise object with updated exercise or null
   */
  update: (id, exerciseData) => {
    const index = exercisesMock.findIndex((ex) => ex.id === parseInt(id));
    if (index === -1) return Promise.resolve(null);

    exercisesMock[index] = { ...exercisesMock[index], ...exerciseData };
    return Promise.resolve(exercisesMock[index]);
  },

  /**
   * Delete an exercise
   * @param {Number} id - Exercise ID
   * @return {Promise} Promise resolving to boolean success value
   */
  delete: (id) => {
    const index = exercisesMock.findIndex((ex) => ex.id === parseInt(id));
    if (index === -1) return Promise.resolve(false);

    exercisesMock.splice(index, 1);
    return Promise.resolve(true);
  },
};

export default exerciseModel;
