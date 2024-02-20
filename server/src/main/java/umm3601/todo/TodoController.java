package umm3601.todo;
import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Filters.regex;

// import java.nio.charset.StandardCharsets;
// import java.security.MessageDigest;
// import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.regex.Pattern;

import org.bson.Document;
import org.bson.UuidRepresentation;
import org.bson.conversions.Bson;
import org.bson.types.ObjectId;
import org.mongojack.JacksonMongoCollection;

import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Sorts;
import com.mongodb.client.result.DeleteResult;

import io.javalin.Javalin;
import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;
import io.javalin.http.NotFoundResponse;
import umm3601.Controller;


public class TodoController implements Controller {

  private static final String API_TODOS = "/api/todos";
  private static final String API_TODO_BY_ID = "/api/todos/{id}";

  static final String OWNER_KEY = "owner";
  static final String CATEGORY_KEY = "category";
  static final String BODY_KEY = "body";
  static final Boolean STATUS_KEY = true | false;
  static final String SORT_ORDER_KEY = "sortorder";

  private final JacksonMongoCollection<Todo> todoCollection;
  private static final String CATEGORY_REGEX = "^(software design|video games|homework|groceries)$";

  /**
   * Construct a controller for todos.
   *
   * @param database the database containing todo data
   */

  public TodoController(MongoDatabase database) {
    todoCollection = JacksonMongoCollection.builder().build(
        database,
        "users",
        Todo.class,
        UuidRepresentation.STANDARD);
  }

    /**
   * Set the JSON body of the response to be the single todo
   * specified by the `id` parameter in the request
   *
   * @param ctx a Javalin HTTP context
   */

  public void getTodo(Context ctx) {
    String id = ctx.pathParam("id");
    Todo todo;

    try {
      todo = todoCollection.find(eq("_id", new ObjectId(id))).first();
    } catch (IllegalArgumentException e) {
      throw new BadRequestResponse("The requested todo id wasn't a legal Mongo Object ID.");
    }
    if (todo == null) {
      throw new NotFoundResponse("The requested todo was not found");
    } else {
      ctx.json(todo);
      ctx.status(HttpStatus.OK);
    }
  }

    /**
   * Set the JSON body of the response to be a list of all the users returned from the database
   * that match any requested filters and ordering
   *
   * @param ctx a Javalin HTTP context
   */

  public void getTodos(Context ctx) {
    Bson combinedFilter = constructFilter(ctx);
    Bson sortingOrder = constructSortingOrder(ctx);
    ArrayList<Todo> matchingTodos = todoCollection
      .find(combinedFilter)
      .sort(sortingOrder)
      .into(new ArrayList<>());
    ctx.json(matchingTodos);
    ctx.status(HttpStatus.OK);
  }

  /**
   * Construct a Bson filter document to use in the `find` method based on the
   * query parameters from the context.
   *
   * This checks for the presence of the `age`, `company`, and `role` query
   * parameters and constructs a filter document that will match users with
   * the specified values for those fields.
   *
   * @param ctx a Javalin HTTP context, which contains the query parameters
   *    used to construct the filter
   * @return a Bson filter document that can be used in the `find` method
   *   to filter the database collection of users
   */


  private Bson constructFilter(Context ctx) {
    List<Bson> filters = new ArrayList<>();

    if (ctx.queryParamMap().containsKey(OWNER_KEY)) {
      Pattern pattern = Pattern.compile(Pattern.quote(ctx.queryParam(OWNER_KEY)), Pattern.CASE_INSENSITIVE);
      filters.add(regex(OWNER_KEY, pattern));
    }

    Bson combinedFilter = filters.isEmpty() ? new Document() : and(filters);

    return combinedFilter;
  }

  /**
   * Construct a Bson sorting document to use in the `sort` method based on the
   * query parameters from the context.
   *
   * This checks for the presence of the `sortby` and `sortorder` query
   * parameters and constructs a sorting document that will sort users by
   * the specified field in the specified order. If the `sortby` query
   * parameter is not present, it defaults to "name". If the `sortorder`
   * query parameter is not present, it defaults to "asc".
   *
   * @param ctx a Javalin HTTP context, which contains the query parameters
   *   used to construct the sorting order
   * @return a Bson sorting document that can be used in the `sort` method
   *  to sort the database collection of users
   */

  private Bson constructSortingOrder(Context ctx) {
    String sortBy = Objects.requireNonNullElse(ctx.queryParam("sortby"), "name");
    String sortOrder = Objects.requireNonNullElse(ctx.queryParam("sortorder"), "asc");
    Bson sortingOrder = sortOrder.equals("desc") ?  Sorts.descending(sortBy) : Sorts.ascending(sortBy);
    return sortingOrder;
  }

  /**
   * @param ctx
   */

   public void addNewTodo(Context ctx) {
    Todo newTodo = ctx.bodyValidator(Todo.class)
    .check(td -> td.owner != null && td.owner.length() > 0, "Todo owner must have a not empty owner")
    .check(td -> td.category.matches(CATEGORY_REGEX), "Todo must have a legal category")
    .check(td -> td.body != null && td.body.length() > 0, "Todo body must have a not empty body")
    .check(td -> td.status || !td.status, "Todo status must have a boolean")
    .get();

    todoCollection.insertOne(newTodo);
    ctx.json(Map.of("id", newTodo._id));
    ctx.status(HttpStatus.CREATED);
   }

    /**
   * Delete the todo specified by the `id` parameter in the request.
   *
   * @param ctx a Javalin HTTP context
   */

  public void deleteTodo(Context ctx) {
    String id = ctx.pathParam("id");
    DeleteResult deleteResult = todoCollection.deleteOne(eq("_id", new ObjectId(id)));
    // We should have deleted 1 or 0 users, depending on whether `id` is a valid todo ID.
    if (deleteResult.getDeletedCount() != 1) {
      ctx.status(HttpStatus.NOT_FOUND);
      throw new NotFoundResponse(
        "Was unable to delete ID "
          + id
          + "; perhaps illegal ID or an ID for an item not in the system?");
    }
    ctx.status(HttpStatus.OK);
  }

  /**
   * @param server
   * @param todoController
   */

   public void addRoutes(Javalin server) {
      server.get(API_TODO_BY_ID, this::getTodo);
      server.get(API_TODOS, this::getTodos);
      server.delete(API_TODO_BY_ID, this::deleteTodo);
      server.post(API_TODOS, this::addNewTodo);

  }
}
