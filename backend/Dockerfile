# syntax=docker/dockerfile:1

# ---------- Build ----------
# A separate build stage means the final image never carries the JDK, Maven's dependency cache or
# source code — only the runtime and the jar it needs to run.
FROM eclipse-temurin:25-jdk AS build
WORKDIR /app

# Dependencies are resolved before the source is copied in, so editing a Java file does not bust
# this layer's cache and force every dependency to be re-downloaded on the next build.
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -B -ntp dependency:go-offline

COPY src ./src
RUN ./mvnw -B -ntp -DskipTests package && mv target/*.jar target/app.jar

# ---------- Runtime ----------
FROM eclipse-temurin:25-jre
WORKDIR /app

# Running as a dedicated, non-root user follows the same reasoning as never storing a plaintext
# password: a compromised process should not inherit more privilege than it needs.
RUN groupadd --system fretlab && useradd --system --gid fretlab fretlab
COPY --from=build /app/target/app.jar app.jar
USER fretlab

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
