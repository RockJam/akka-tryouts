package tictactoe

import akka.actor.{ActorRef, Props}
import akka.io.Tcp.{Closed, PeerClosed}
import shared._
import spray.can.websocket.frame.{BinaryFrame, CloseFrame, TextFrame}
import spray.http.HttpRequest
import spray.json._
import spray.routing.HttpServiceActor

object TicTacToeWorker {
  def props(serverConnection: ActorRef) = Props(classOf[TicTacToeWorker], serverConnection)
}

class TicTacToeWorker(val serverConnection: ActorRef) extends HttpServiceActor with WebSocketBase {
  override def pool = context actorSelection "akka://sockets/user/tic-tac-toe-resources"

  override def businessLogicNoUpgrade = runRoute {
    path("ticTacToe") {
      getFromResource("ticTacToe.html")
    }
  }

  override def ready(shared: ActorRef): Receive = {
    case TextFrame(text) if (text utf8String) startsWith "join"  =>
          import ResponseJsonProtocol._
          val failure = Failure("already acquired resource")
          send(TextFrame(failure.toJson.toString))
    case TextFrame(text) =>
      import GameMove._
      val message = text
        .utf8String
        .parseJson
        .convertTo[GameMove]
      shared ! message
    case m: Response =>
      import ResponseJsonProtocol._
      val json = m.toJson
      send(TextFrame(json toString))
    case CloseFrame(_, _) | PeerClosed | Closed =>
      context stop shared
      context stop self

    //we don't expect these types
    case x: BinaryFrame => println("1 " + x)
    case x: HttpRequest => println("2 " + x)
    case x: AnyRef => println("3 " + x)
  }

}