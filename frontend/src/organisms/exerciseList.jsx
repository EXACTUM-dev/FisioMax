// frontend/src/organisms/exerciseList.jsx
/**
 * @fileoverview Componente para mostrar la lista de ejercicios desde el backend
 * @version 1.0.0
 * @author EXACTUM-dev
 */
import React, { useState, useEffect } from "react";
import { exerciseApi } from "../api/exerciseApi";
import { Title2, Title3, Paragraph2 } from "../atoms/typography";
import Button from "../atoms/button";

export default function ExerciseList() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");

  // Categorías disponibles para filtrar
  const categories = ["Upper Body", "Lower Body", "Core"];

  // Cargar ejercicios desde la API al montar el componente o cambiar la categoría
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true);
        setError(null);

        const filters = selectedCategory ? { category: selectedCategory } : {};
        const data = await exerciseApi.getAll(filters);
        setExercises(data);
      } catch (err) {
        console.error("Error fetching exercises:", err);
        setError(
          "No se pudieron cargar los ejercicios. Inténtelo de nuevo más tarde."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [selectedCategory]);

  return (
    <div className="max-w-[70rem] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <Title2>Ejercicios Fisioterapéuticos</Title2>

        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <Button
            size="xs"
            variant={selectedCategory === "" ? "brand" : "outline"}
            label="Todos"
            onClick={() => setSelectedCategory("")}
          />
          {categories.map((category) => (
            <Button
              key={category}
              size="xs"
              variant={selectedCategory === category ? "brand" : "outline"}
              label={category}
              onClick={() => setSelectedCategory(category)}
            />
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      ) : exercises.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No se encontraron ejercicios para esta categoría.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              {exercise.imageUrl && (
                <div className="h-48 bg-gray-100">
                  <img
                    src={exercise.imageUrl}
                    alt={exercise.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/400x300?text=Exercise+Image";
                    }}
                  />
                </div>
              )}

              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <Title3>{exercise.name}</Title3>
                  <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                    {exercise.difficulty || "N/A"}
                  </span>
                </div>

                <Paragraph2 className="text-gray-600 mb-3 line-clamp-2">
                  {exercise.description}
                </Paragraph2>

                <div className="flex flex-wrap gap-1 mb-3">
                  {exercise.muscleGroups?.map((muscle) => (
                    <span
                      key={muscle}
                      className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded"
                    >
                      {muscle}
                    </span>
                  ))}
                </div>

                {(exercise.recommendedSets || exercise.recommendedReps) && (
                  <div className="text-sm text-gray-500 mt-2">
                    Recomendado: {exercise.recommendedSets || "-"} series ×{" "}
                    {exercise.recommendedReps || "-"} reps
                  </div>
                )}

                <Button
                  className="mt-4 w-full"
                  size="sm"
                  label="Ver Detalles"
                  variant="outline"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
