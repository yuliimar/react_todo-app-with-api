import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import { Todo } from '../types/Todo';

type TodoItemProps = {
  todo: Todo;
  onDelete: (id: number) => Promise<void>;
  onUpdate: (id: number, data: Partial<Todo>) => Promise<void>;
  onError: (message: string) => void;
};

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onDelete,
  onUpdate,
  onError,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [isLoadingLocal, setIsLoadingLocal] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [isEditing]);

  const handleStatusChange = async () => {
    try {
      setIsLoadingLocal(true);
      await onUpdate(todo.id, { completed: !todo.completed });
    } catch {
      onError('Unable to update a todo');
    } finally {
      setIsLoadingLocal(false);
    }
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditTitle(todo.title);
  };

  const handleEditSubmit = async () => {
    const trimmedTitle = editTitle.trim();

    if (trimmedTitle === todo.title) {
      setIsEditing(false);

      return;
    }

    if (!trimmedTitle) {
      try {
        setIsLoadingLocal(true);
        await onDelete(todo.id);
      } catch {
        onError('Unable to delete a todo');
      } finally {
        setIsLoadingLocal(false);
      }

      return;
    }

    try {
      setIsLoadingLocal(true);
      await onUpdate(todo.id, { title: trimmedTitle });
      setIsEditing(false);
    } catch {
      onError('Unable to update a todo');
      setEditTitle(todo.title);
      setIsEditing(false);
    } finally {
      setIsLoadingLocal(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditTitle(todo.title);
    }
  };

  const isLoading = todo.isLoading || isLoadingLocal;

  return (
    <div
      data-cy="Todo"
      className={classNames('todo', {
        completed: todo.completed,
        editing: isEditing,
      })}
    >
      <label className="todo__status-label">
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          checked={todo.completed}
          onChange={handleStatusChange}
          disabled={isLoading}
          aria-label={todo.completed ? 'Mark as active' : 'Mark as completed'}
        />
      </label>

      {isEditing ? (
        <form
          onSubmit={e => {
            e.preventDefault();
            handleEditSubmit();
          }}
        >
          <input
            data-cy="TodoTitleField"
            type="text"
            className="todo__title-field"
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            onBlur={handleEditSubmit}
            onKeyDown={handleKeyDown}
            ref={editInputRef}
            disabled={isLoading}
          />
        </form>
      ) : (
        <>
          <span
            data-cy="TodoTitle"
            className="todo__title"
            onDoubleClick={handleDoubleClick}
          >
            {todo.title}
          </span>

          <button
            type="button"
            className="todo__remove"
            data-cy="TodoDelete"
            onClick={() => onDelete(todo.id)}
            disabled={isLoading}
            aria-label="Delete todo"
          >
            ×
          </button>
        </>
      )}

      <div
        data-cy="TodoLoader"
        className={classNames('modal overlay', {
          'is-active': isLoading,
        })}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};
