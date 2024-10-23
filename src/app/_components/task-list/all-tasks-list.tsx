"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { exampleTasks } from "@/constants/mockData";
import { theOnlyToastId } from "@/constants/uiConstants";
import { useSortedByCategoryTasks } from "@/hooks/useSortedTasks";
import { cn } from "@/lib/utils";
import { getGridPosition } from "@/lib/utils/get-grid-position";
import { type Task } from "@/types/task";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AddOrEditTaskSheet } from "./add-or-edit-task-sheet";
import { SwipeableAllTask } from "./swipeable-all-task";
import { categoryMapping } from "./today-tasks-list";

export const AllTasksList = () => {
  const [tasks, setTasks] = useState<Task[]>(exampleTasks);
  const sortedTasks = useSortedByCategoryTasks(tasks);

  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  const dialogOpenChange = useCallback(() => {
    setIsDialogOpen(!isDialogOpen);
    setSelectedCategory("");
  }, [isDialogOpen]);

  useEffect(() => {
    if (
      sortedTasks[selectedCategory as keyof typeof sortedTasks] &&
      sortedTasks[selectedCategory as keyof typeof sortedTasks].length === 0
    ) {
      dialogOpenChange();
    }
  }, [dialogOpenChange, selectedCategory, sortedTasks]);

  const deleteTask = (id: string) => {
    const taskToDelete = tasks.find((task) => task.id === id);

    if (taskToDelete) {
      const updatedTasks = tasks.filter((task) => task.id !== taskToDelete.id);
      setTasks(updatedTasks);
      toast.success("Task deleted successfully!", { id: theOnlyToastId });
    }
  };

  const handleCardClick = (category: string) => {
    setSelectedCategory(category);
    setIsDialogOpen(true);
  };

  return (
    <>
      <div className="h-full w-full">
        {tasks.length !== 0 ? (
          <div className="grid h-full grid-cols-2 grid-rows-2 gap-6 overflow-auto px-2 pb-8">
            {Object.entries(sortedTasks)
              .filter(([_, tasks]) => tasks.length > 0)
              .map(([category, tasks], index) => (
                <Card
                  key={category}
                  className={cn(
                    "flex max-h-[27vh] cursor-pointer items-center justify-center border-primary",
                    getGridPosition(index),
                  )}
                  onClick={() => handleCardClick(category)}
                >
                  <CardContent className="p-6 text-center">
                    <p className="text-lg text-primary">
                      {
                        categoryMapping[
                          category as keyof typeof categoryMapping
                        ]
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ({tasks.length} task{tasks.length > 1 ? "s" : ""})
                    </p>
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : (
          <div className="flex flex-grow items-center justify-center text-center">
            Click the + icon to add your first task!
          </div>
        )}
      </div>

      <Button
        className="fixed bottom-6 right-4 z-50 h-[3.5rem] w-[3.5rem] rounded-full bg-accent"
        onClick={() => setIsSheetOpen(true)}
      >
        <Plus size={28} className="text-accent-foreground" />
      </Button>

      <AddOrEditTaskSheet
        isSheetOpen={isSheetOpen}
        setIsSheetOpen={setIsSheetOpen}
        setTasks={setTasks}
        taskType="add"
      />

      <Dialog open={isDialogOpen} onOpenChange={dialogOpenChange}>
        <DialogContent className="flex h-auto max-h-[75vh] min-h-[25vh] w-[90vw] max-w-none flex-col items-center justify-center overflow-y-auto rounded-md border-border bg-card px-0 pb-10 pt-14 sm:max-w-sm">
          <DialogTitle className="sr-only">
            {categoryMapping[selectedCategory as keyof typeof categoryMapping]}{" "}
            Tasks
          </DialogTitle>
          <DialogDescription className="sr-only">
            List of tasks for{" "}
            {categoryMapping[selectedCategory as keyof typeof categoryMapping]}
          </DialogDescription>

          <p className="text-md mb-1 px-2 pb-2 text-center">
            <span>
              Swipe to <span className="text-destructive">delete a task</span>,
              Tap to edit
            </span>
          </p>

          <div className="w-full px-6">
            {sortedTasks[selectedCategory as keyof typeof sortedTasks]?.map(
              (task) => (
                <SwipeableAllTask
                  key={task.id}
                  task={task}
                  setTasks={setTasks}
                  handleSwipe={() => deleteTask(task.id)}
                />
              ),
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
