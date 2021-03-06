import React from 'react';
import './style.css';

function Task(props) {
  // Props:
  //  onClick -> check box function
  //  style -> margin style for check box (different for first button)
  //  cont -> the check mark
  //  textDecoration -> line through text after completion
  //  tasktitle -> title of the task
  //  delete -> function carried out by delete button
  //  number -> key, but not called key, because of complications with deleting the property
  return (
    <div className="task" style={props.divStyle}>
      <span className="task-cb-title">
        <button
          className="checkBox"
          onClick={() => props.onClick()}
          style={props.style}
        >
          <p>{props.cont}</p>
        </button>
        <p className="taskTitle" style={props.textDecoration}>
          {props.taskTitle}
        </p>
      </span>
      <button className="delete-btn" onClick={() => props.delete(props.number)}>
        x
      </button>
    </div>
  );
}

class DisplayOptions extends React.Component {
  //Props:
  //  onClick -> action on click of "show complete"
  //  showCompleted -> showCompleted from App
  render() {
    return (
      <div className="displayofoptions">
        <div className="showcompleted">
          <input
            type="checkbox"
            id="showcompletedcb"
            name="showcompletedcb"
            checked={this.props.showCompleted}
            onChange={() => this.props.onClick()}
          />
          <label className="showcompletedl" htmlFor="showcompletedcb">
            Show Completed
          </label>
        </div>
      </div>
    );
  }
}

class CategoryPicker extends React.Component {
  //Props:
  //  onChoice -> when clicking category in banner
  //  categories -> array of all the avaailable categories
  //  displayedCategory -> currently displayed category
  render() {
    return (
      <div className="cat-box">
        <h2> Categories </h2>
        <ul>
          {this.props.categories.map((title, i) => (
            <li className="cat-li">
              {' '}
              <button
                onClick={() => {
                  this.props.onChoice(i);
                }}
                className={
                  'categories' +
                  (this.props.displayedCategory == i ? ' chosen-category' : '')
                }
              >
                {i > 0 ? title : 'All'}
              </button>{' '}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

function drop() {
  document.getElementById('category-picker').classList.toggle('show');
}

class TaskAdder extends React.Component {
  // Props:
  //  categories -> array of all categories
  //  displayedCategory -> currently displayed category
  constructor(props) {
    super(props);
    this.state = {
      currentCategory: 0,
      disable: true,
      disableCat: false,
      value: ''
    };
  }
  render() {
    if (
      (!this.state.disableCat ||
        this.state.currentCategory != this.props.displayedCategory) &&
      this.props.displayedCategory != 0
    ) {
      this.setState({
        currentCategory: this.props.displayedCategory,
        disableCat: true
      });
    } else if (this.props.displayedCategory == 0 && this.state.disableCat)
      this.setState({ disableCat: false });
    return (
      <div className="taskAdder box">
        <input
          type="text"
          className="textBox"
          id="textInput"
          onChange={e => this.setState({ value: e.target.value })}
          autocomplete="off"
          onKeyUp={e => {
            if (e.keyCode == 13) {
              e.preventDefault();
              document.getElementById('addButton').click();
            }
          }}
          placeholder={'Enter task here'}
        />
        <button
          className="addButton"
          id="addButton"
          onClick={() => {
            this.props.add(this.state.currentCategory);
            this.setState({
              value: ''
            });
          }}
          disabled={this.state.value.trim() == ''}
        >
          ADD
        </button>

        <div className="dropdown">
          <button
            className="categoryButton"
            id="category-btn"
            onClick={() => drop()}
            disabled={this.state.disableCat}
          >
            {this.props.categories[this.state.currentCategory]}
          </button>
          <div className="category-picker" id="category-picker">
            {this.props.categories
              .filter((cat, i) => i != this.state.currentCategory)
              .map((category, i) => {
                return (
                  <li className="category-li">
                    <button
                      className="category-pick"
                      onClick={() =>
                        this.setState({
                          currentCategory:
                            i + (i >= this.state.currentCategory ? 1 : 0)
                        })
                      }
                    >
                      {category}
                    </button>
                  </li>
                );
              })}
          </div>
        </div>
      </div>
    );
  }
}

class TodoApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      categories: ['No Category', 'Work', 'Hobbies', 'Groceries', 'Chores'],
      tasks: [],
      displayedCategory: 0,
      showCompleted: true
    };
    this.updatedTasks = [];
  }
  componentDidMount() {
    if (localStorage.length > 3) {
      let inp = JSON.parse(localStorage.getItem('tasks')); //input
      this.setState({ tasks: inp.slice() });
      // this.setState({ tasks: inp });
    } else {
      fetch('https://60d8582ca376360017f45fe2.mockapi.io/todos', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(data => this.setState({ tasks: [...data] }));
    }
  }
  componentWillUnmount() {
    this.updateStorage();
  }
  addTask(catOfNew) {
    let titleNew = document.getElementById('textInput').value.trim();
    if (titleNew == '') return;
    let currentTasks = this.state.tasks.slice().concat({
      id: this.state.tasks.length,
      creationDate: new Date(),
      title: titleNew,
      completed: false,
      category: catOfNew
    });
    this.setState({
      tasks: currentTasks
    });
    localStorage.setItem('tasks', JSON.stringify(currentTasks));
    document.getElementById('textInput').value = '';
    if (
      this.state.displayedCategory != 0 &&
      catOfNew != this.state.displayedCategory
    )
      this.setState({ displayedCategory: catOfNew });
  }
  updateStorage() {
    localStorage.setItem('tasks', JSON.stringify(this.state.tasks));
  }
  checkUncheck(i) {
    i.completed = !i.completed;
    this.forceUpdate();
    this.updateStorage();
  }
  renderTask(task, border) {
    let divStyle = border ? {} : { border: 'none' };
    let textDecoration = task.completed
      ? { textDecoration: 'line-through' }
      : {};
    return (
      <Task
        number={task.id}
        taskTitle={task.title}
        divStyle={divStyle}
        onClick={() => this.checkUncheck(task)}
        cont={task.completed ? '???' : ''}
        delete={x => {
          let copy = this.state.tasks.slice();
          copy.splice(x, 1);
          this.setState({
            tasks: copy
          });
          localStorage.setItem('tasks', JSON.stringify(copy));
        }}
        textDecoration={textDecoration}
      />
    );
  }

  render() {
    let message = (
      <h2 className="plsAddTasks">
        Type a todo in textbox above <br /> then use "ADD" Button to add a task{' '}
      </h2>
    );
    let filtered = this.state.tasks
      .map((task, i) => {
        task.id = i;
        return task;
      })
      .filter(
        task =>
          (this.state.showCompleted || !task.completed) &&
          (this.state.displayedCategory == 0 ||
            this.state.displayedCategory == task.category)
      );
    return (
      <div className="all">
        <div className="view">
          <h1 className="Title">
            Your Todos ( Remaining{' '}
            {this.state.tasks.filter(task => !task.completed).length} )
          </h1>
          <TaskAdder
            add={x => {
              this.addTask(x);
            }}
            categories={this.state.categories}
            displayedCategory={this.state.displayedCategory}
          />
          <DisplayOptions
            showCompleted={this.state.showCompleted}
            onClick={() =>
              this.setState({
                showCompleted: !this.state.showCompleted
              })
            }
          />
          <div className="taskDisplay box">
            {filtered.length > 0
              ? filtered.map((task, i) => this.renderTask(task, i > 0))
              : message}
          </div>
        </div>
        <CategoryPicker
          onChoice={x => {
            this.setState({ displayedCategory: x });
          }}
          categories={this.state.categories}
          displayedCategory={this.state.displayedCategory}
        />
      </div>
    );
  }
}

export default function App() {
  return <TodoApp id="todoapp" />;
}
