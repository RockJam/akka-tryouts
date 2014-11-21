package observer

import akka.actor.{ActorRef, Props}
import spray.can.websocket.WebSocketServerWorker
import spray.can.websocket.frame.TextFrame
import spray.json._
import spray.routing.HttpServiceActor
import tictactoe.{ObservableState, GameState}

object Subscriber {
  def props(serverConnection: ActorRef) = Props(classOf[Subscriber], serverConnection)
}

class Subscriber(val serverConnection:ActorRef) extends HttpServiceActor with WebSocketServerWorker {

  override def receive = handshaking orElse businessLogicNoUpgrade orElse closeLogic

  def businessLogicNoUpgrade = runRoute {
    pathPrefix("js") {
      get {
        getFromResourceDirectory("js")
      }
    } ~
      pathPrefix("css") {
        get {
          getFromResourceDirectory("css")
        }
      } ~
      pathPrefix("images") {
        get {
          getFromResourceDirectory("images")
        }
      } ~
      path("view") {
        getFromResource("view.html")
      }
  }

  override def businessLogic = {
    case x@ObservableState(sndr, GameState(field, status)) =>
      import ObservableState._
      send(TextFrame(x.toJson.toString))
      sndr.path.name

      println(
        s"""
          |======================
          |sender name is ${sndr.path.name}
          |sender serialized is ${sndr.path.toSerializationFormat}
          |sender without address is ${sndr.path.toStringWithoutAddress}
          |field is: $field
          |status is: $status
        """.stripMargin)
  }

}