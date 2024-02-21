package umm3601.todo;

import static com.mongodb.client.model.Filters.eq;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.ArgumentMatcher;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.mongodb.MongoClientSettings;
import com.mongodb.ServerAddress;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

import io.javalin.Javalin;
import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;
import io.javalin.http.NotFoundResponse;
import io.javalin.json.JavalinJackson;
import io.javalin.validation.BodyValidator;
import io.javalin.validation.ValidationException;
import io.javalin.validation.Validator;
import umm3601.user.UserController;


/**
 * Tests the logic of the UserController
 *
 * @throws IOException
 */

@SuppressWarnings({"MagicNumber"})
class TodoControllerSpec {

  private TodoController todoController;
  private ObjectId blancheId;
  private static MongoClient mongoClient;
  private static MongoDatabase db;
  private static JavalinJackson javalinJackson = new JavalinJackson();

  @Mock
  private Context ctx;

  @Captor
  private ArgumentCaptor<ArrayList<Todo>> todoArrayListCaptor;

  @Captor
  private ArgumentCaptor<Todo> todoCaptor;

  @Captor
  private ArgumentCaptor<Map<String, String>> mapCaptor;

  @BeforeAll
  static void setupAll() {
    String mongoAddr = System.getenv().getOrDefault("MONGO_ADDR", "localhost");

    mongoClient = MongoClients.create(
        MongoClientSettings.builder()
            .applyToClusterSettings(builder -> builder.hosts(Arrays.asList(new ServerAddress(mongoAddr))))
            .build());
    db = mongoClient.getDatabase("test");
  }

  @AfterAll
  static void teardown() {
    db.drop();
    mongoClient.close();
  }

  @BeforeEach
  void setupEach() throws IOException {
    // Reset our mock context and argument captor (declared with Mockito annotations
    // @Mock and @Captor)
    MockitoAnnotations.openMocks(this);

    // Setup database
    MongoCollection<Document> todoDocuments = db.getCollection("todos");
    todoDocuments.drop();
    List<Document> testTodos = new ArrayList<>();
    testTodos.add(
      new Document()
          .append("owner", "Fry")
          .append("body","I play games a little a day")
          .append("status", true)
          .append("category", "video games"));
    testTodos.add(
      new Document()
          .append("owner", "Fry")
          .append("body","I do homework")
          .append("status", false)
          .append("category", "homework"));
    testTodos.add(
      new Document()
          .append("owner", "Blanche")
          .append("body","I do groceries")
          .append("status", true)
          .append("category", "groceries"));
    testTodos.add(
      new Document()
          .append("owner", "Blanche")
          .append("body","I am software design")
          .append("status", false)
          .append("category", "software design"));

    blancheId = new ObjectId();
    Document blanche = new Document()
        .append("_id", blancheId)
        .append("owner", "Blanche")
        .append("body","I play games all day")
        .append("status", false)
        .append("category", "video games");

    todoDocuments.insertMany(testTodos);
    todoDocuments.insertOne(blanche);

    todoController = new TodoController(db);
  }

  @Test
  public void canBuildController() throws IOException {
    Javalin mockServer = Mockito.mock(Javalin.class);
    todoController.addRoutes(mockServer);
    verify(mockServer, Mockito.atLeast(2)).get(any(), any());
  }

  @Test
  void canGetAllTodos() throws IOException {
    when(ctx.queryParamMap()).thenReturn(Collections.emptyMap());
    todoController.getTodos(ctx);
    verify(ctx).json(todoArrayListCaptor.capture());
    verify(ctx).status(HttpStatus.OK);
    assertEquals(db.getCollection("todos").countDocuments(), todoArrayListCaptor.getValue().size());
  }

  @Test
  void getTodoWithExistentId() throws IOException {
    String id = blancheId.toHexString();
    when(ctx.pathParam("id")).thenReturn(id);

    todoController.getTodo(ctx);

    verify(ctx).json(todoCaptor.capture());
    verify(ctx).status(HttpStatus.OK);
    assertEquals("Blanche", todoCaptor.getValue().owner);
    assertEquals(blancheId.toHexString(), todoCaptor.getValue()._id);
  }

  @Test
  void getTodoWithBadId() throws IOException {
    when(ctx.pathParam("id")).thenReturn("bad");

    Throwable exception = assertThrows(BadRequestResponse.class, () -> {
      todoController.getTodo(ctx);
    });

    assertEquals("The requested todo id wasn't a legal Mongo Object ID.", exception.getMessage());
  }

  @Test
  void getTodoWithNonexistentId() throws IOException {
    String id = "588935f5c668650dc77df581";
    when(ctx.pathParam("id")).thenReturn(id);

    Throwable exception = assertThrows(NotFoundResponse.class, () -> {
      todoController.getTodo(ctx);
    });

    assertEquals("The requested todo was not found", exception.getMessage());
  }


}
